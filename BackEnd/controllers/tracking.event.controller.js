import * as trackingEventService from "../services/tracking.event.service.js";
import ResponseError from "../utils/customError.js";
import { trackingEventSchema } from "../utils/validation.js";

// 🟩 Add tracking event to an order (seller only)
export async function addTrackingEvent(req, res, next) {
  try {
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId) || orderId <= 0) {
      throw new ResponseError("Invalid order ID", 400);
    }

    const { error } = trackingEventSchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const event = await trackingEventService.addTrackingEvent(
      orderId,
      req.user.id,
      req.body
    );

    res.status(201).json({
      message: "Tracking event added",
      event,
    });
  } catch (err) {
    next(err);
  }
}

// 🟦 Get tracking events for an order
export async function getTrackingEvents(req, res, next) {
  try {
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId) || orderId <= 0) {
      throw new ResponseError("Invalid order ID", 400);
    }

    const events = await trackingEventService.getTrackingEvents(
      orderId,
      req.user.id
    );

    res.json(events);
  } catch (err) {
    next(err);
  }
}
