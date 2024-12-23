import { Router } from "express";
import { getCasteHierarchyTree } from "../controllers/casteHirarchy.js";

const router = Router();

router.route("/getTree").get(getCasteHierarchyTree);

export default router;
