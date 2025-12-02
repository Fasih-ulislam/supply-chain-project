import * as transporterService from "../services/transporter.service.js";
import ResponseError from "../utils/customError.js";
import {
  transporterSchema,
  transporterUpdateSchema,
} from "../utils/validation.js";

// 🟩 Create transporter (admin only)
export async function createTransporter(req, res, next) {
  try {
    const { error } = transporterSchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const transporter = await transporterService.createTransporter(req.body);

    res.status(201).json({
      message: "Transporter created successfully",
      transporter,
    });
  } catch (err) {
    next(err);
  }
}

// 🟦 Get all transporters
export async function getAllTransporters(req, res, next) {
  try {
    const transporters = await transporterService.getAllTransporters();
    res.json(transporters);
  } catch (err) {
    next(err);
  }
}

// 🟦 Get transporter by ID
export async function getTransporterById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      throw new ResponseError("Invalid transporter ID", 400);
    }

    const transporter = await transporterService.getTransporterById(id);
    res.json(transporter);
  } catch (err) {
    next(err);
  }
}

// 🟧 Update transporter
export async function updateTransporter(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      throw new ResponseError("Invalid transporter ID", 400);
    }

    const { error } = transporterUpdateSchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    // Ensure at least one field is being updated
    if (Object.keys(req.body).length === 0) {
      throw new ResponseError("No fields to update", 400);
    }

    const transporter = await transporterService.updateTransporter(
      id,
      req.body
    );

    res.json({
      message: "Transporter updated successfully",
      transporter,
    });
  } catch (err) {
    next(err);
  }
}

// ⬛ Delete transporter
export async function deleteTransporter(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      throw new ResponseError("Invalid transporter ID", 400);
    }

    await transporterService.deleteTransporter(id);

    res.json({ message: "Transporter deleted successfully" });
  } catch (err) {
    next(err);
  }
}
