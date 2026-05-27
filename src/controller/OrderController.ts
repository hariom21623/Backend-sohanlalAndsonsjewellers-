import { Request, Response } from "express";
import prisma from "../config/db.config.js";

export default class OrderController {

  static async placeOrder(req: Request, res: Response) {
    try {
      const { customerName, customerPhone, items, totalAmount } = req.body;
      const user = (req as any).user;
      const userId = user ? user.id : "guest-user";

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: "Cart is empty" });
      }

      const newOrder = await prisma.order.create({
        data: {
          userId,
          customerName: customerName || (user?.name || "Guest"),
          customerPhone: customerPhone || (user?.phoneNumber || "0000000000"),
          items: items,
          totalAmount: Number(totalAmount),
          status: "PENDING"
        }
      });

      // Response ko confirm karo
      return res.status(200).json({ success: true, order: newOrder });
    } catch (err) {
      console.error("PRISMA ERROR:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async getAllOrders(req: Request, res: Response) {
    try {
      const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });

      // Yahan check lagao
      if (orders.length === 0) {
        return res.json({ success: true, message: "No Order found", orders: [] });
      }

      return res.json({ success: true, orders });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async updateStatusOnly(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const existingOrder = await prisma.order.findUnique({ where: { id } });
      if (!existingOrder) return res.status(404).json({ success: false, message: "Order not found" });

      // Stock Logic: Sirf tabhi minus karo jab status ACCEPTED ho raha ho
      if (status === "ACCEPTED" && existingOrder.status !== "ACCEPTED") {
        const items = existingOrder.items as any[];
        for (const item of items) {
          await prisma.product.updateMany({
            where: { name: item.name },
            data: { stock: { decrement: item.qty } }
          });
        }
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status }
      });

      return res.json({ success: true, order: updatedOrder });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Status update failed" });
    }
  }

  // 2. Sirf Order Data edit karne ke liye (Stock ko touch nahi karega)
  static async editOrderDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { items, totalAmount } = req.body;

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { items, totalAmount }
      });

      return res.json({ success: true, order: updatedOrder });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Edit failed" });
    }
  }

  static async deleteOrder(req: Request, res: Response) {
    try {
      await prisma.order.delete({ where: { id: req.params.id } });
      return res.json({ success: true, message: "Order deleted" });
    } catch (err) {
      return res.status(500).json({ success: false });
    }
  }
}