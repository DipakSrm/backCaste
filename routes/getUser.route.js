import { Router } from "express";
import { getUsers,getUser } from "../controllers/getUser.js";
const router = Router();

router.route("/getUsers").get(getUsers);
router.route("/getUser").get(getUser);
export default router;
