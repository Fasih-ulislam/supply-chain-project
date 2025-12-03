import prisma from "../config/database.js";
import ResponseError from "../utils/customError.js";

// 🟩 Create a new role request (SUPPLIER or DISTRIBUTOR only)
export async function createRoleRequest(userId, data) {
  // Check if user already has a non-CUSTOMER role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new ResponseError("User not found", 404);

  if (user.role !== "CUSTOMER") {
    throw new ResponseError(
      `You already have the ${user.role} role. One role per account.`,
      400
    );
  }

  // Check if there's already a pending request
  const existingRequest = await prisma.roleRequest.findFirst({
    where: {
      userId,
      status: "PENDING",
    },
  });

  if (existingRequest) {
    throw new ResponseError(
      "You already have a pending role request. Please wait for admin approval.",
      400
    );
  }

  // Validate requested role
  if (!["SUPPLIER", "DISTRIBUTOR"].includes(data.requestedRole)) {
    throw new ResponseError(
      "Invalid role. Only SUPPLIER or DISTRIBUTOR can be requested.",
      400
    );
  }

  return prisma.roleRequest.create({
    data: {
      userId,
      requestedRole: data.requestedRole,
      businessName: data.businessName,
      businessAddress: data.businessAddress,
      contactNumber: data.contactNumber,
      NTN: data.NTN || null,
      // Role-specific fields
      licenseNumber:
        data.requestedRole === "SUPPLIER" ? data.licenseNumber : null,
      serviceArea:
        data.requestedRole === "DISTRIBUTOR" ? data.serviceArea : null,
    },
  });
}

// 🟦 Get all requests (admin-only)
export async function getAllRoleRequests() {
  return prisma.roleRequest.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// 🟦 Get pending requests (admin-only)
export async function getPendingRoleRequests() {
  return prisma.roleRequest.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// 🟨 Get my requests by user ID
export async function getMyRoleRequestsByUserId(userId) {
  return prisma.roleRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

// 🟥 Approve or Reject a request (FULL TRANSACTION)
export async function updateRequestStatus(id, status) {
  return await prisma.$transaction(async (tx) => {
    // 1. Get the request
    const request = await tx.roleRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!request) throw new ResponseError("Role request not found", 404);

    if (request.status !== "PENDING") {
      throw new ResponseError(
        `Request has already been ${request.status.toLowerCase()}`,
        400
      );
    }

    // Check if user still has CUSTOMER role
    if (request.user.role !== "CUSTOMER") {
      throw new ResponseError(
        `User already has ${request.user.role} role. Cannot approve.`,
        400
      );
    }

    // 2. Update the request status
    const updatedRequest = await tx.roleRequest.update({
      where: { id },
      data: { status },
    });

    // -----------------------------------
    // CASE: APPROVE REQUEST
    // -----------------------------------
    if (status === "APPROVED") {
      const { userId, requestedRole } = request;

      // Update user role
      await tx.user.update({
        where: { id: userId },
        data: { role: requestedRole },
      });

      // Create profile based on role
      if (requestedRole === "SUPPLIER") {
        // Create SupplierProfile
        const supplierProfile = await tx.supplierProfile.create({
          data: {
            userId,
            businessName: request.businessName,
            businessAddress: request.businessAddress,
            contactNumber: request.contactNumber,
            NTN: request.NTN,
            licenseNumber: request.licenseNumber,
          },
        });

        // Auto-create warehouse for supplier
        await tx.warehouse.create({
          data: {
            supplierId: supplierProfile.id,
            name: "Main Warehouse",
            address: request.businessAddress,
          },
        });
      } else if (requestedRole === "DISTRIBUTOR") {
        // Create DistributorProfile
        await tx.distributorProfile.create({
          data: {
            userId,
            businessName: request.businessName,
            businessAddress: request.businessAddress,
            contactNumber: request.contactNumber,
            NTN: request.NTN,
            serviceArea: request.serviceArea,
          },
        });
      }

      return {
        ...updatedRequest,
        message: `User promoted to ${requestedRole}. Profile created.`,
      };
    }

    // -----------------------------------
    // CASE: REJECT REQUEST
    // -----------------------------------
    return {
      ...updatedRequest,
      message: "Role request rejected.",
    };
  });
}

// 🟨 Get request by ID
export async function getRequestById(id) {
  return prisma.roleRequest.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });
}

// ⬛ Delete role request (admin can delete rejected/old requests)
export async function deleteRoleRequest(id) {
  const request = await prisma.roleRequest.findUnique({
    where: { id },
  });

  if (!request) throw new ResponseError("Role request not found", 404);

  return prisma.roleRequest.delete({
    where: { id },
  });
}
