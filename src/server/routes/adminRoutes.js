import { Router } from "express";
import { create, list, remove, update } from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth, requireAdmin);
router.get("/:resource", list);
router.post("/:resource", create);
router.put("/:resource/:id", update);
router.delete("/:resource/:id", remove);

export default router;
