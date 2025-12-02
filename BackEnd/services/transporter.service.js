import prisma from "../config/database.js";
import ResponseError from "../utils/customError.js";

// 🟩 Create transporter (admin only)
export async function createTransporter(data) {
  const { name, phone } = data;

  return prisma.transporter.create({
    data: { name, phone },
  });
}

// 🟦 Get all transporters
export async function getAllTransporters() {
  return prisma.transporter.findMany({
    include: {
      _count: {
        select: { orders: true },
      },
    },
  });
}

// 🟦 Get transporter by ID
export async function getTransporterById(id) {
  const transporter = await prisma.transporter.findUnique({
    where: { id },
    include: {
      orders: {
        where: { status: "IN_TRANSIT" },
        include: {
          product: true,
          buyer: { select: { id: true, name: true } },
          seller: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!transporter) throw new ResponseError("Transporter not found", 404);

  return transporter;
}

// 🟧 Update transporter
export async function updateTransporter(id, data) {
  const transporter = await prisma.transporter.findUnique({
    where: { id },
  });

  if (!transporter) throw new ResponseError("Transporter not found", 404);

  return prisma.transporter.update({
    where: { id },
    data,
  });
}

// ⬛ Delete transporter
export async function deleteTransporter(id) {
  return await prisma.$transaction(async (tx) => {
    const transporter = await tx.transporter.findUnique({
      where: { id },
    });

    if (!transporter) throw new ResponseError("Transporter not found", 404);

    // Check for active orders
    const activeOrders = await tx.order.count({
      where: {
        transporterId: id,
        status: "IN_TRANSIT",
      },
    });

    if (activeOrders > 0) {
      throw new ResponseError(
        "Cannot delete: Transporter has active deliveries",
        400
      );
    }

    // Unlink from completed orders
    await tx.order.updateMany({
      where: { transporterId: id },
      data: { transporterId: null },
    });

    return tx.transporter.delete({
      where: { id },
    });
  });
}
