import prisma from "../config/database.js";
import ResponseError from "../utils/customError.js";

// 🟩 Create product
export async function createProduct(createdById, data) {
  return prisma.product.create({
    data: {
      ...data,
      createdById,
    },
  });
}

// 🟦 Get all products (admin)
export async function getAllProducts() {
  return prisma.product.findMany({
    include: {
      createdBy: true,
    },
  });
}

// 🟨 Get product by ID
export async function getProductById(id) {
  return prisma.product.findUnique({
    where: { id },
  });
}

// 🟨 Get my products (supplier)
export async function getMyProducts(createdById) {
  return prisma.product.findMany({
    where: { createdById },
  });
}

// 🟧 Update product with owner check
export async function updateMyProduct(productId, userId, data) {
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new ResponseError("Product not found", 404);
    if (product.createdById !== userId)
      throw new ResponseError("Unauthorized: You do not own this product", 403);

    return tx.product.update({
      where: { id: productId },
      data,
    });
  });
}

// ⬛ Delete product with owner check
export async function deleteMyProduct(productId, userId) {
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new ResponseError("Product not found", 404);
    if (product.createdById !== userId)
      throw new ResponseError("Unauthorized: You do not own this product", 403);

    return tx.product.delete({
      where: { id: productId },
    });
  });
}
