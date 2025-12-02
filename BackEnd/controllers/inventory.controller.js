import * as inventoryService from "../services/inventory.service.js";
import ResponseError from "../utils/customError.js";
import {
  addInventorySchema,
  updateInventorySchema,
  getStoreQuerySchema,
} from "../utils/validation.js";

// 🟩 Add product to my inventory/store
export async function addToInventory(req, res, next) {
  try {
    const { activeRole } = req.user;

    if (!activeRole || activeRole === "CUSTOMER" || activeRole === "ADMIN") {
      throw new ResponseError("Only sellers can manage inventory", 403);
    }

    const { error } = addInventorySchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const inventory = await inventoryService.addToInventory(
      req.user.id,
      activeRole,
      req.body
    );

    res.status(201).json({
      message: "Product added to inventory",
      inventory,
    });
  } catch (err) {
    next(err);
  }
}

// 🟧 Update inventory quantity
export async function updateInventoryQuantity(req, res, next) {
  try {
    const { activeRole } = req.user;
    const inventoryId = parseInt(req.params.id);

    if (isNaN(inventoryId) || inventoryId <= 0) {
      throw new ResponseError("Invalid inventory ID", 400);
    }

    if (!activeRole || activeRole === "CUSTOMER" || activeRole === "ADMIN") {
      throw new ResponseError("Only sellers can manage inventory", 403);
    }

    const { error } = updateInventorySchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const { quantity } = req.body;
    const inventory = await inventoryService.updateInventoryQuantity(
      req.user.id,
      activeRole,
      inventoryId,
      quantity
    );

    res.json({
      message: "Inventory updated",
      inventory,
    });
  } catch (err) {
    next(err);
  }
}

// 🟦 Get my inventory (my store)
export async function getMyInventory(req, res, next) {
  try {
    const { activeRole } = req.user;

    if (!activeRole || activeRole === "CUSTOMER" || activeRole === "ADMIN") {
      throw new ResponseError("Only sellers have inventory", 403);
    }

    const inventory = await inventoryService.getMyInventory(
      req.user.id,
      activeRole
    );

    res.json(inventory);
  } catch (err) {
    next(err);
  }
}

// 🟦 Get all stores (public - browse all available stores)
export async function getAllStores(req, res, next) {
  try {
    const stores = await inventoryService.getAllStores();
    res.json(stores);
  } catch (err) {
    next(err);
  }
}

// 🟦 Get a specific store
export async function getStore(req, res, next) {
  try {
    const sellerId = parseInt(req.params.sellerId);
    if (isNaN(sellerId) || sellerId <= 0) {
      throw new ResponseError("Invalid seller ID", 400);
    }

    const { error } = getStoreQuerySchema.validate(req.query);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const { role } = req.query;
    const store = await inventoryService.getStore(sellerId, role);
    res.json(store);
  } catch (err) {
    next(err);
  }
}

// ⬛ Remove product from inventory
export async function removeFromInventory(req, res, next) {
  try {
    const { activeRole } = req.user;
    const inventoryId = parseInt(req.params.id);

    if (isNaN(inventoryId) || inventoryId <= 0) {
      throw new ResponseError("Invalid inventory ID", 400);
    }

    if (!activeRole || activeRole === "CUSTOMER" || activeRole === "ADMIN") {
      throw new ResponseError("Only sellers can manage inventory", 403);
    }

    await inventoryService.removeFromInventory(
      req.user.id,
      activeRole,
      inventoryId
    );

    res.json({ message: "Inventory removed successfully" });
  } catch (err) {
    next(err);
  }
}
