import { Router } from "express";
import { announcements } from "../controllers/publicController.js";

const router = Router();

router.get("/vigentes", announcements);

export default router;
