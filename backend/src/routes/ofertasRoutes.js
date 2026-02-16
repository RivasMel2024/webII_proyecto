import { Router } from "express";
import { getTopOffers, getAllOffers  } from "../controllers/ofertasController.js";

const router = Router();

router.get("/top", getTopOffers);
router.get("/", getAllOffers);
export default router;
