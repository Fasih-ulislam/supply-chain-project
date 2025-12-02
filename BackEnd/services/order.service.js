import prisma from "../config/database.js";
import ResponseError from "../utils/customError.js";

// 🟩 Create an order (Buyer places order from a store)
export async function createOrder(buyerId, data) {
  const { productId, inventoryId, sellerId, quantity, deliveryAddress } = data;

  return await prisma.$transaction(async (tx) => {
    // Verify inventory exists and has enough stock
    const inventory = await tx.inventory.findUnique({
      where: { id: inventoryId },
      include: { product: true },
    });

    if (!inventory) throw new ResponseError("Inventory not found", 404);

    // Verify the inventory belongs to the seller
    if (inventory.userId !== sellerId) {
      throw new ResponseError("Invalid seller for this inventory", 400);
    }

    // Verify product matches
    if (inventory.productId !== productId) {
      throw new ResponseError("Product does not match inventory", 400);
    }

    // Check stock availability
    if (inventory.quantity < quantity) {
      throw new ResponseError(
        `Insufficient stock. Available: ${inventory.quantity}`,
        400
      );
    }

    // Prevent self-ordering
    if (buyerId === sellerId) {
      throw new ResponseError("Cannot order from yourself", 400);
    }

    const totalAmount = inventory.product.price * quantity;

    // Create the order
    const order = await tx.order.create({
      data: {
        quantity,
        totalAmount,
        productId,
        inventoryId,
        buyerId,
        sellerId,
        deliveryAddress,
        status: "PENDING",
      },
      include: {
        product: true,
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
        inventory: true,
      },
    });

    // Add initial tracking event (buyer -> seller)
    await tx.trackingEvent.create({
      data: {
        orderId: order.id,
        fromUserId: buyerId,
        toUserId: sellerId,
        status: "PENDING",
        description: `Order placed for ${quantity} x ${inventory.product.name}`,
      },
    });

    return order;
  });
}

// 🟦 Seller views orders they received
export async function getSellerOrders(sellerId) {
  return prisma.order.findMany({
    where: { sellerId },
    include: {
      product: true,
      buyer: { select: { id: true, name: true, email: true } },
      inventory: true,
      transporter: true,
      trackingEvents: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
    orderBy: { orderDate: "desc" },
  });
}

// 🟦 Buyer views their orders
export async function getBuyerOrders(buyerId) {
  return prisma.order.findMany({
    where: { buyerId },
    include: {
      product: true,
      seller: { select: { id: true, name: true, email: true } },
      inventory: true,
      transporter: true,
      trackingEvents: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
    orderBy: { orderDate: "desc" },
  });
}

// 🟧 Buyer cancels their order
export async function cancelOrder(orderId, buyerId) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { inventory: true, product: true },
    });

    if (!order) throw new ResponseError("Order not found", 404);

    if (order.buyerId !== buyerId) {
      throw new ResponseError(
        "Unauthorized: You can only cancel your own orders",
        403
      );
    }

    // Can cancel at any point except DELIVERED or already CANCELLED/RETURNED
    if (["DELIVERED", "CANCELLED", "RETURNED"].includes(order.status)) {
      throw new ResponseError(
        `Cannot cancel order with status: ${order.status}`,
        400
      );
    }

    // If order was APPROVED or beyond, restore the stock
    if (["APPROVED", "PROCESSING", "IN_TRANSIT"].includes(order.status)) {
      await tx.inventory.update({
        where: { id: order.inventoryId },
        data: {
          quantity: { increment: order.quantity },
        },
      });
    }

    // Update order status
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
      include: { product: true, seller: true },
    });

    // Add tracking event (buyer initiated cancellation)
    await tx.trackingEvent.create({
      data: {
        orderId,
        fromUserId: buyerId,
        toUserId: order.sellerId,
        status: "CANCELLED",
        description: "Order cancelled by buyer",
      },
    });

    return updatedOrder;
  });
}

// 🟧 Seller approves or rejects order
export async function processOrderBySeller(orderId, sellerId, action) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { inventory: true, product: true },
    });

    if (!order) throw new ResponseError("Order not found", 404);

    if (order.sellerId !== sellerId) {
      throw new ResponseError("Unauthorized: You are not the seller", 403);
    }

    if (order.status !== "PENDING") {
      throw new ResponseError(
        `Cannot process order with status: ${order.status}`,
        400
      );
    }

    if (action === "APPROVE") {
      // Check stock availability again at approval time
      if (order.inventory.quantity < order.quantity) {
        throw new ResponseError(
          `Insufficient stock. Available: ${order.inventory.quantity}, Required: ${order.quantity}`,
          400
        );
      }

      // Deduct from inventory
      await tx.inventory.update({
        where: { id: order.inventoryId },
        data: {
          quantity: { decrement: order.quantity },
        },
      });

      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "APPROVED" },
        include: { product: true, buyer: true },
      });

      // Add tracking event (seller -> buyer)
      await tx.trackingEvent.create({
        data: {
          orderId,
          fromUserId: sellerId,
          toUserId: order.buyerId,
          status: "APPROVED",
          description: "Order approved by seller. Stock reserved.",
        },
      });

      return updatedOrder;
    } else if (action === "REJECT") {
      // Update order status to cancelled
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
        include: { product: true, buyer: true },
      });

      // Add tracking event (seller rejected)
      await tx.trackingEvent.create({
        data: {
          orderId,
          fromUserId: sellerId,
          toUserId: order.buyerId,
          status: "CANCELLED",
          description: "Order rejected by seller",
        },
      });

      return updatedOrder;
    }

    throw new ResponseError("Invalid action. Use APPROVE or REJECT", 400);
  });
}

// 🟧 Seller updates order status (PROCESSING, IN_TRANSIT)
export async function updateOrderStatusBySeller(
  orderId,
  sellerId,
  status,
  data = {}
) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (!order) throw new ResponseError("Order not found", 404);

    if (order.sellerId !== sellerId) {
      throw new ResponseError("Unauthorized: You are not the seller", 403);
    }

    // Define valid status transitions for seller
    const validTransitions = {
      APPROVED: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["IN_TRANSIT", "CANCELLED"],
      CANCELLED: ["RETURNED"], // Seller can mark as returned after cancellation
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new ResponseError(
        `Invalid status transition from ${order.status} to ${status}`,
        400
      );
    }

    const updateData = { status };

    // If transitioning to IN_TRANSIT, require transporterId
    if (status === "IN_TRANSIT") {
      if (!data.transporterId) {
        throw new ResponseError(
          "Transporter ID is required for IN_TRANSIT status",
          400
        );
      }

      // Verify transporter exists
      const transporter = await tx.transporter.findUnique({
        where: { id: data.transporterId },
      });

      if (!transporter) {
        throw new ResponseError("Transporter not found", 404);
      }

      updateData.transporterId = data.transporterId;
    }

    // If marking as RETURNED, restore stock
    if (status === "RETURNED") {
      await tx.inventory.update({
        where: { id: order.inventoryId },
        data: {
          quantity: { increment: order.quantity },
        },
      });
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: updateData,
      include: { product: true, buyer: true, transporter: true },
    });

    // Add tracking event (seller -> buyer)
    await tx.trackingEvent.create({
      data: {
        orderId,
        fromUserId: sellerId,
        toUserId: order.buyerId,
        status,
        description: data.description || `Order status updated to ${status}`,
      },
    });

    return updatedOrder;
  });
}

// 🟧 Buyer confirms delivery or rejects
export async function confirmDelivery(orderId, buyerId, action) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { product: true, inventory: true },
    });

    if (!order) throw new ResponseError("Order not found", 404);

    if (order.buyerId !== buyerId) {
      throw new ResponseError("Unauthorized: You are not the buyer", 403);
    }

    if (order.status !== "IN_TRANSIT") {
      throw new ResponseError(
        "Order must be IN_TRANSIT to confirm delivery",
        400
      );
    }

    if (action === "CONFIRM") {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "DELIVERED" },
        include: { product: true, seller: true },
      });

      // Tracking: buyer confirms receipt (buyer -> seller as acknowledgment)
      await tx.trackingEvent.create({
        data: {
          orderId,
          fromUserId: buyerId,
          toUserId: order.sellerId,
          status: "DELIVERED",
          description: "Product received and confirmed by buyer",
        },
      });

      return updatedOrder;
    } else if (action === "REJECT") {
      // Buyer rejects delivery - order goes to CANCELLED
      // Stock will be restored when seller marks as RETURNED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
        include: { product: true, seller: true },
      });

      // Tracking: buyer rejects delivery
      await tx.trackingEvent.create({
        data: {
          orderId,
          fromUserId: buyerId,
          toUserId: order.sellerId,
          status: "CANCELLED",
          description: "Product rejected by buyer. Awaiting return.",
        },
      });

      return updatedOrder;
    }

    throw new ResponseError("Invalid action. Use CONFIRM or REJECT", 400);
  });
}

// 🟦 Get order by ID
export async function getOrderById(orderId, userId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      product: true,
      buyer: { select: { id: true, name: true, email: true } },
      seller: { select: { id: true, name: true, email: true } },
      inventory: true,
      transporter: true,
      trackingEvents: {
        orderBy: { timestamp: "asc" },
        include: {
          fromUser: { select: { id: true, name: true } },
          toUser: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!order) throw new ResponseError("Order not found", 404);

  // Only buyer or seller can view order details
  if (order.buyerId !== userId && order.sellerId !== userId) {
    throw new ResponseError("Unauthorized: You cannot view this order", 403);
  }

  return order;
}
