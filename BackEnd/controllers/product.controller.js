import * as productService from "../services/product.service.js";
import { productSchema, productUpdateSchema } from "../utils/validation.js";
import ResponseError from "../utils/customError.js";

// 🟩 Create product (supplier-only)
export async function createProduct(req, res, next) {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    if (!req.user.supplierId)
      throw new ResponseError("Only suppliers can create products", 403);

    const product = await productService.createProduct(
      req.user.supplierId,
      req.body
    );

    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    next(err);
  }
}

// 🟦 Get all products (admin)
export async function getAllProducts(req, res, next) {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
}

// 🟨 Get my products (supplier)
export async function getMyProducts(req, res, next) {
  try {
    if (!req.user.supplierId)
      throw new ResponseError("Only suppliers can view their products", 403);

    const products = await productService.getMyProducts(req.user.supplierId);
    res.json(products);
  } catch (err) {
    next(err);
  }
}

// 🟧 Update my product
export async function updateMyProduct(req, res, next) {
  try {
    const { error } = productUpdateSchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const productId = parseInt(req.params.id);

    const product = await productService.updateMyProduct(
      productId,
      req.user.supplierId,
      req.body
    );

    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    next(err);
  }
}

// ⬛ Delete my product
export async function deleteMyProduct(req, res, next) {
  try {
    const productId = parseInt(req.params.id);

    await productService.deleteMyProduct(productId, req.user.supplierId);

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
}
