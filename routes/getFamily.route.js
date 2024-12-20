import { Router } from "express";
import { getFamilyTree } from "../controllers/getFamily.js";
const router = Router();

router.route("/getFamily/:userId").get(getFamilyTree);

export default router;
