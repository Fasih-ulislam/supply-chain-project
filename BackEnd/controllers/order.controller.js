import * as orderService from "../services/order.service.js";
import ResponseError from "../utils/customError.js";
import {
  createOrderSchema,
  processOrderSchema,
  updateOrderStatusSchema,
  confirmDeliverySchema,
} from "../utils/validation.js";

// 🟩 Create Order (Buyer places order from a store)
export async function createOrder(req, res, next) {
  try {
    const { error } = createOrderSchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const order = await orderService.createOrder(req.user.id, req.body);

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    next(err);
  }
}

// 🟦 Seller views orders they received
export async function getSellerOrders(req, res, next) {
  try {
    const orders = await orderService.getSellerOrders(req.user.id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// 🟦 Buyer views their orders
export async function getBuyerOrders(req, res, next) {
  try {
    const orders = await orderService.getBuyerOrders(req.user.id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// 🟦 Get order by ID
export async function getOrderById(req, res, next) {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId) || orderId <= 0) {
      throw new ResponseError("Invalid order ID", 400);
    }

    const order = await orderService.getOrderById(orderId, req.user.id);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

// 🟧 Buyer cancels their order
export async function cancelOrder(req, res, next) {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId) || orderId <= 0) {
      throw new ResponseError("Invalid order ID", 400);
    }

    const order = await orderService.cancelOrder(orderId, req.user.id);

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (err) {
    next(err);
  }
}

// 🟧 Seller approves or rejects order
export async function processOrder(req, res, next) {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId) || orderId <= 0) {
      throw new ResponseError("Invalid order ID", 400);
    }

    const { error } = processOrderSchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const { action } = req.body;
    const order = await orderService.processOrderBySeller(
      orderId,
      req.user.id,
      action
    );

    res.json({
      message: `Order ${action.toLowerCase()}d successfully`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

// 🟧 Seller updates order status
export async function updateOrderStatus(req, res, next) {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId) || orderId <= 0) {
      throw new ResponseError("Invalid order ID", 400);
    }

    const { error } = updateOrderStatusSchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const { status, transporterId, description } = req.body;

    const order = await orderService.updateOrderStatusBySeller(
      orderId,
      req.user.id,
      status,
      { transporterId, description }
    );

    res.json({
      message: "Order status updated",
      order,
    });
  } catch (err) {
    next(err);
  }
}

// 🟧 Buyer confirms or rejects delivery
export async function confirmDelivery(req, res, next) {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId) || orderId <= 0) {
      throw new ResponseError("Invalid order ID", 400);
    }

    const { error } = confirmDeliverySchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const { action } = req.body;
    const order = await orderService.confirmDelivery(
      orderId,
      req.user.id,
      action
    );

    res.json({
      message:
        action === "CONFIRM" ? "Delivery confirmed" : "Delivery rejected",
      order,
    });
  } catch (err) {
    next(err);
  }
}
