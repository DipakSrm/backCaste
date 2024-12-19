import { Router } from "express";
import { createUser,updateUser } from "../controllers/createUser.js";
const router=Router()
router.route('/createUser').post(createUser)
router.route('/updateUser/:userId').put(updateUser)
export default router