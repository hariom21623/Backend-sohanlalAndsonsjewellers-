import { Router } from "express";
import OrderController from "../controller/OrderController.js";
import authMiddleware from "../middleware/AuthMiddleware.js";
import { verifyAdmin } from "../middleware/AdminMiddleware.js";

const router = Router();

router.post("/place", authMiddleware, OrderController.placeOrder);

// (Admin only)
router.get("/all", authMiddleware, verifyAdmin, OrderController.getAllOrders);
router.put("/status/:id", authMiddleware, verifyAdmin, OrderController.updateStatusOnly);
router.put("/edit/:id", authMiddleware, verifyAdmin, OrderController.editOrderDetails);
router.delete("/delete/:id", authMiddleware, verifyAdmin, OrderController.deleteOrder);

export default router;