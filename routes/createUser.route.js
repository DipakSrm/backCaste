import { Router } from "express";
import { upload } from "../middlewares.js/multer.middleware.js";
import { createUser,updateUser } from "../controllers/createUser.js";
import { getUser } from "../controllers/getUser.js";
const router=Router()
router.route('/createUser').post(upload.fields([
    {name:"avatar",
        maxCount:1
    },
    {
        name:"front",
        maxCount:1
    },
    {name:"back",
        maxCount:1
    }
]),createUser)
router.route('/updateUser/:userId').put(updateUser)
export default router