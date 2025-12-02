import prisma from "../config/database.js";

// 🟩 Create a new request
export async function createRoleRequest(userId, data) {
  return prisma.roleRequest.create({
    data: {
      ...data,
      userId,
    },
  });
}

// 🟦 Get all requests (admin-only)
export async function getAllRoleRequests() {
  return prisma.roleRequest.findMany({
    include: {
      user: true,
    },
  });
}

// 🟦 Get pending requests (admin-only)
export async function getPendingRoleRequests() {
  return prisma.roleRequest.findMany({
    where: { status: "PENDING" },
    include: {
      user: true,
    },
  });
}

// 🟨 Get my requests by user ID
export async function getMyRoleRequestsByUserId(userId) {
  return prisma.roleRequest.findMany({
    where: { userId },
  });
}

// 🟥 Approve or Reject a request (FULL TRANSACTION)
export async function updateRequestStatus(id, status) {
  return await prisma.$transaction(async (tx) => {
    // 1. Update the request status
    const updatedRequest = await tx.roleRequest.update({
      where: { id },
      data: { status },
    });

    const { userId, requestedRole } = updatedRequest;

    // -----------------------------------
    // CASE: APPROVE REQUEST
    // -----------------------------------
    if (status === "APPROVED") {
      // Assign role (idempotent)
      await tx.userRole.upsert({
        where: {
          userId_role: {
            userId,
            role: requestedRole,
          },
        },
        update: {},
        create: {
          userId,
          role: requestedRole,
        },
      });

      return updatedRequest;
    }

    // -----------------------------------
    // CASE: REJECT REQUEST
    // -----------------------------------
    // Remove assigned role (if it exists)
    await tx.userRole.deleteMany({
      where: {
        userId,
        role: requestedRole,
      },
    });

    return updatedRequest;
  });
}

// 🟨 Get request by ID
export async function getRequestById(id) {
  return prisma.roleRequest.findUnique({
    where: { id },
    include: { user: true },
  });
}

// ⬛ Delete role request (transaction-safe)
export async function deleteRoleRequest(id) {
  return await prisma.$transaction(async (tx) => {
    return tx.roleRequest.delete({
      where: { id },
    });
  });
}
