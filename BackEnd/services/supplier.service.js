import prisma from "../config/database.js";

// 🟩 Create supplier (transaction)
export async function createSupplier(userId, data) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create supplier
    const supplier = await tx.supplier.create({
      data,
      include: {
        user: true,
      },
    });

    // 2. Assign supplier to the user
    await tx.user.update({
      where: { id: userId },
      data: {
        supplierId: supplier.id,
      },
    });

    return supplier;
  });
}

// 🟦 Get all suppliers (admin)
export async function getAllSuppliers() {
  return await prisma.supplier.findMany({
    include: {
      users: true,
      products: true,
      shipments: true,
    },
  });
}

// 🟨 Get supplier by ID
export async function getSupplierById(id) {
  return await prisma.supplier.findUnique({
    where: { id },
    include: {
      products: true,
      shipments: true,
    },
  });
}

// 🟨 Get supplier by User ID
export async function getSupplierByUserId(userId) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      supplier: true,
    },
  });
}

// 🟨 Update supplier by User ID
export async function updateSupplierByUserId(userId, data) {
  return await prisma.$transaction(async (tx) => {
    const supplier = await tx.user.findUnique({
      where: { id: userId },
      select: {
        supplier: true,
      },
    });

    if (!supplier || !supplier.supplier)
      throw new ResponseError("Supplier not found", 404);
    // 1. Unlink users
    return await tx.supplier.update({
      where: { id: supplier.supplier.id },
      data: { ...data },
    });
  });
}

// 🟧 Update supplier
export async function updateSupplier(id, data) {
  return await prisma.supplier.update({
    where: { id },
    data,
  });
}

// ⬛ Delete supplier (transaction)
export async function deleteSupplier(id) {
  return await prisma.$transaction(async (tx) => {
    // 1. Unlink users
    await tx.user.updateMany({
      where: { supplierId: id },
      data: { supplierId: null },
    });

    // 2. Delete supplier
    return await tx.supplier.delete({
      where: { id },
    });
  });
}
