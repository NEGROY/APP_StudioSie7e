import { Router } from "express";
import { announcements, models, promotions, services } from "../controllers/publicController.js";

const router = Router();

router.get("/servicios", services);
router.get("/modelos", models);
router.get("/promociones", promotions);
router.get("/anuncios", announcements);

export default router;
