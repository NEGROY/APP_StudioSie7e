import { Router } from "express";
import { announcements, promotions, services } from "../controllers/publicController.js";

const router = Router();

router.get("/servicios", services);
router.get("/promociones", promotions);
router.get("/anuncios", announcements);

export default router;
