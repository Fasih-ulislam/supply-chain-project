import prisma from "../config/database.js";

// 🟦 Get all users with SUPPLIER role (admin)
export async function getAllSuppliers() {
  return await prisma.user.findMany({
    where: {
      userRoles: {
        some: {
          role: "SUPPLIER",
        },
      },
    },
    include: {
      userRoles: true,
      products: true,
      ordersReceived: true,
    },
  });
}

// 🟨 Get supplier (user) by ID
export async function getSupplierById(id) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      userRoles: true,
      products: true,
      ordersReceived: {
        include: {
          product: true,
          buyer: true,
        },
      },
    },
  });
}

// 🟧 Update supplier (user) data
export async function updateSupplier(id, data) {
  // Remove role-related fields if present, as roles should be managed separately
  const { userRoles, ...updateData } = data;

  return await prisma.user.update({
    where: { id },
    data: updateData,
    include: {
      userRoles: true,
    },
  });
}
