import { Router } from "express";
import {getAllVideos} from '../controllers/video.controllers'
import { upload } from "../middlewares/multer.middleware";

const router = Router()

router.route("/getvideo").get(upload.single([
    {
        name: videoFile,
        maxCount:1
        
    }
]),getAllVideos)


export default router