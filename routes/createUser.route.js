import { Router } from "express";
import { upload } from "../middlewares.js/multer.middleware.js";
import { createUser } from "../controllers/createUser.js";
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
export default router