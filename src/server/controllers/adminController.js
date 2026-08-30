import * as adminModel from "../models/adminModel.js";

export async function list(req, res, next) {
  try {
    const rows = await adminModel.list(req.params.resource, req.query);
    return res.json(rows);
  } catch (error) {
    return next(adminModel.normalizeDatabaseError(error));
  }
}

export async function create(req, res, next) {
  try {
    const row = await adminModel.create(req.params.resource, req.body);
    return res.status(201).json(row);
  } catch (error) {
    return next(adminModel.normalizeDatabaseError(error));
  }
}

export async function update(req, res, next) {
  try {
    const row = await adminModel.update(req.params.resource, req.params.id, req.body);
    return res.json(row);
  } catch (error) {
    return next(adminModel.normalizeDatabaseError(error));
  }
}

export async function remove(req, res, next) {
  try {
    const row = await adminModel.remove(req.params.resource, req.params.id);
    return res.json(row);
  } catch (error) {
    return next(adminModel.normalizeDatabaseError(error));
  }
}
