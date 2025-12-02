import prisma from "../config/database.js";
import ResponseError from "../utils/customError.js";

// 🟩 Add tracking event to an order (seller only)
export async function addTrackingEvent(orderId, userId, data) {
  const { description } = data;

  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new ResponseError("Order not found", 404);

    // Only seller can add tracking events
    if (order.sellerId !== userId) {
      throw new ResponseError(
        "Unauthorized: Only seller can add tracking events",
        403
      );
    }

    // Order must be in a trackable state
    if (!["APPROVED", "PROCESSING", "IN_TRANSIT"].includes(order.status)) {
      throw new ResponseError(
        `Cannot add tracking events for order with status: ${order.status}`,
        400
      );
    }

    return tx.trackingEvent.create({
      data: {
        orderId,
        fromUserId: userId,
        toUserId: order.buyerId,
        status: order.status, // Current status
        description,
      },
      include: {
        fromUser: { select: { id: true, name: true } },
        toUser: { select: { id: true, name: true } },
      },
    });
  });
}

// 🟦 Get tracking events for an order
export async function getTrackingEvents(orderId, userId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new ResponseError("Order not found", 404);

  // Only buyer or seller can view tracking
  if (order.buyerId !== userId && order.sellerId !== userId) {
    throw new ResponseError(
      "Unauthorized: You cannot view this order's tracking",
      403
    );
  }

  return prisma.trackingEvent.findMany({
    where: { orderId },
    include: {
      fromUser: { select: { id: true, name: true } },
      toUser: { select: { id: true, name: true } },
    },
    orderBy: { timestamp: "asc" },
  });
}
