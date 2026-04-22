import { Router } from "express";
import ProductController from "../controller/ProductController.js";
import authMiddleware from "../middleware/AuthMiddleware.js";
import { verifyAdmin } from "../middleware/AdminMiddleware.js";

const router = Router();

//Admin Routes
router.post("/addProduct", authMiddleware, verifyAdmin, ProductController.create);
router.get("/getAllProduct", authMiddleware, verifyAdmin, ProductController.getAll);
router.get("/getById/:id", authMiddleware, verifyAdmin, ProductController.getById);
router.put("/updateById/:id", authMiddleware, verifyAdmin, ProductController.update);
router.delete("/delete/:id", authMiddleware, verifyAdmin, ProductController.remove);

//User Routes
router.get("/public/getAllProduct", ProductController.getAllPublic);
router.get("/public/getById/:id", ProductController.getByIdPublic);

export default router;
