import express from "express";
import * as orderController from "../controllers/order.controller.js";
import { authorizeRoles } from "../middlewares/validate.user.middleware.js";

const router = express.Router();

// 🟩 Buyer creates order
router.post(
  "/",
  authorizeRoles("SUPPLIER", "DISTRIBUTOR", "RETAILER", "CUSTOMER"),
  orderController.createOrder
);

// 🟦 Seller views orders they received
router.get(
  "/seller",
  authorizeRoles("SUPPLIER", "DISTRIBUTOR", "RETAILER"),
  orderController.getSellerOrders
);

// 🟦 Buyer views their orders
router.get(
  "/buyer",
  authorizeRoles("SUPPLIER", "DISTRIBUTOR", "RETAILER", "CUSTOMER"),
  orderController.getBuyerOrders
);

// 🟦 Get order by ID
router.get(
  "/:id",
  authorizeRoles("SUPPLIER", "DISTRIBUTOR", "RETAILER", "CUSTOMER"),
  orderController.getOrderById
);

// 🟧 Buyer cancels their order
router.patch(
  "/:id/cancel",
  authorizeRoles("SUPPLIER", "DISTRIBUTOR", "RETAILER", "CUSTOMER"),
  orderController.cancelOrder
);

// 🟧 Seller approves/rejects order (action: APPROVE or REJECT)
router.patch(
  "/:id/process",
  authorizeRoles("SUPPLIER", "DISTRIBUTOR", "RETAILER"),
  orderController.processOrder
);

// 🟧 Seller updates order status (PROCESSING, IN_TRANSIT, RETURNED)
router.patch(
  "/:id/status",
  authorizeRoles("SUPPLIER", "DISTRIBUTOR", "RETAILER"),
  orderController.updateOrderStatus
);

// 🟧 Buyer confirms/rejects delivery (action: CONFIRM or REJECT)
router.patch(
  "/:id/delivery",
  authorizeRoles("SUPPLIER", "DISTRIBUTOR", "RETAILER", "CUSTOMER"),
  orderController.confirmDelivery
);

export default router;
