import prisma from "../config/database.js";
import ResponseError from "../utils/customError.js";

// 🟩 Add product to inventory (seller creates/updates their store)
export async function addToInventory(userId, activeRole, data) {
  const { productId, quantity } = data;

  return await prisma.$transaction(async (tx) => {
    // Verify product exists
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new ResponseError("Product not found", 404);

    // Check if inventory entry already exists
    const existingInventory = await tx.inventory.findUnique({
      where: {
        userId_productId_role: {
          userId,
          productId,
          role: activeRole,
        },
      },
    });

    if (existingInventory) {
      // Update existing inventory
      return tx.inventory.update({
        where: { id: existingInventory.id },
        data: {
          quantity: existingInventory.quantity + quantity,
        },
        include: { product: true, user: true },
      });
    }

    // Create new inventory entry
    return tx.inventory.create({
      data: {
        userId,
        productId,
        role: activeRole,
        quantity,
      },
      include: { product: true, user: true },
    });
  });
}

// 🟧 Update inventory quantity (seller manually adjusts stock)
export async function updateInventoryQuantity(
  userId,
  activeRole,
  inventoryId,
  quantity
) {
  return await prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({
      where: { id: inventoryId },
    });

    if (!inventory) throw new ResponseError("Inventory not found", 404);

    // Verify ownership
    if (inventory.userId !== userId || inventory.role !== activeRole) {
      throw new ResponseError(
        "Unauthorized: You do not own this inventory",
        403
      );
    }

    if (quantity < 0) {
      throw new ResponseError("Quantity cannot be negative", 400);
    }

    return tx.inventory.update({
      where: { id: inventoryId },
      data: { quantity },
      include: { product: true },
    });
  });
}

// 🟦 Get my inventory (seller's store for their active role)
export async function getMyInventory(userId, activeRole) {
  return prisma.inventory.findMany({
    where: {
      userId,
      role: activeRole,
    },
    include: {
      product: true,
    },
  });
}

// 🟦 Get all stores (public - anyone can browse)
export async function getAllStores() {
  // Group inventories by userId and role to represent "stores"
  const inventories = await prisma.inventory.findMany({
    where: {
      quantity: { gt: 0 }, // Only show stores with stock
    },
    include: {
      product: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Group by seller (userId + role combination)
  const storesMap = new Map();

  for (const inv of inventories) {
    const storeKey = `${inv.userId}-${inv.role}`;
    if (!storesMap.has(storeKey)) {
      storesMap.set(storeKey, {
        sellerId: inv.userId,
        sellerName: inv.user.name,
        sellerRole: inv.role,
        products: [],
      });
    }
    storesMap.get(storeKey).products.push({
      inventoryId: inv.id,
      productId: inv.productId,
      productName: inv.product.name,
      category: inv.product.category,
      description: inv.product.description,
      price: inv.product.price,
      quantity: inv.quantity,
    });
  }

  return Array.from(storesMap.values());
}

// 🟦 Get single store by sellerId and role
export async function getStore(sellerId, role) {
  const inventories = await prisma.inventory.findMany({
    where: {
      userId: sellerId,
      role,
      quantity: { gt: 0 },
    },
    include: {
      product: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (inventories.length === 0) {
    throw new ResponseError("Store not found or empty", 404);
  }

  return {
    sellerId,
    sellerName: inventories[0].user.name,
    sellerRole: role,
    products: inventories.map((inv) => ({
      inventoryId: inv.id,
      productId: inv.productId,
      productName: inv.product.name,
      category: inv.product.category,
      description: inv.product.description,
      price: inv.product.price,
      quantity: inv.quantity,
    })),
  };
}

// ⬛ Remove product from inventory
export async function removeFromInventory(userId, activeRole, inventoryId) {
  return await prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({
      where: { id: inventoryId },
    });

    if (!inventory) throw new ResponseError("Inventory not found", 404);

    if (inventory.userId !== userId || inventory.role !== activeRole) {
      throw new ResponseError(
        "Unauthorized: You do not own this inventory",
        403
      );
    }

    // Check for pending orders
    const pendingOrders = await tx.order.count({
      where: {
        inventoryId,
        status: { in: ["PENDING", "APPROVED", "PROCESSING", "IN_TRANSIT"] },
      },
    });

    if (pendingOrders > 0) {
      throw new ResponseError(
        "Cannot remove: There are pending orders for this inventory",
        400
      );
    }

    return tx.inventory.delete({
      where: { id: inventoryId },
    });
  });
}
