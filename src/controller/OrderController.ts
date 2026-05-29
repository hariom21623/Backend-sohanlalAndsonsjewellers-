import { Request, Response } from "express";
import prisma from "../config/db.config.js";

export default class OrderController {

  // src/controllers/OrderController.ts
  static async placeOrder(req: Request, res: Response) {
    try {
      const { customerName, customerPhone, items, totalAmount } = req.body;
      const userAuth = (req as any).user;
      const userId = userAuth ? userAuth.id : null;

      let userData = {
        name: customerName || "Guest",
        phone: customerPhone || "0000000000",
        address: "Not provided",
        pincode: "N/A"
      };

      // ✅ DB se data tabhi uthayenge agar userId hai
      if (userId) {
        const userFromDb = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, phoneNumber: true, address: true, pincode: true } // ✅ Yahan select karna zaroori hai
        });

        if (userFromDb) {
          userData.name = customerName || userFromDb.name;
          userData.phone = customerPhone || userFromDb.phoneNumber;
          userData.address = userFromDb.address || "Not provided";
          userData.pincode = userFromDb.pincode || "N/A";
        }
      }

      // Backend: OrderController.ts
      const newOrder = await prisma.order.create({
        data: {
          userId: userId || "guest-user",
          customerName: userData.name,
          customerPhone: userData.phone,
          address: userData.address, // ✅ DB mein ye value ja rahi hai
          pincode: userData.pincode, // ✅ DB mein ye value ja rahi hai
          items: items,
          totalAmount: Number(totalAmount),
          status: "PENDING"
        }
      });

      // ✅ SABSE ZAROORI: Yahan return mein newOrder return ho raha hai
      return res.status(200).json({ success: true, order: newOrder });
    } catch (err) {
      console.error("PRISMA ERROR:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async getAllOrders(req: Request, res: Response) {
    try {
      const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
      return res.json({ success: true, orders });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // static async updateStatusOnly(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;
  //     const { status } = req.body;

  //     const existingOrder = await prisma.order.findUnique({ where: { id } });
  //     if (!existingOrder) return res.status(404).json({ success: false, message: "Order not found" });

  //     if (status === "ACCEPTED" && existingOrder.status !== "ACCEPTED") {
  //       const items = existingOrder.items as any[];
  //       for (const item of items) {
  //         await prisma.product.updateMany({
  //           where: { name: item.name },
  //           data: { stock: { decrement: item.qty } }
  //         });
  //       }
  //     }

  //     const updatedOrder = await prisma.order.update({
  //       where: { id },
  //       data: { status }
  //     });

  //     return res.json({ success: true, order: updatedOrder });
  //   } catch (err) {
  //     return res.status(500).json({ success: false, message: "Status update failed" });
  //   }
  // }

  static async editOrderDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { items, totalAmount, address, pincode } = req.body; // ✅ Edit mein bhi address/pincode

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { items, totalAmount, address, pincode }
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

  static async getMyOrders(req: Request, res: Response) {
    const userId = (req as any).user.id; // Auth middleware se mila
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, orders });
  }

  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body; // "ACCEPTED" ya "REJECTED"

      // 1. Order Update karo
      const order = await prisma.order.update({
        where: { id },
        data: { status }
      });

      // 2. Notification Create karo (Automatic)
      if (status === "ACCEPTED") {
        await prisma.notification.create({
          data: {
            userId: order.userId, // Order karne wale user ki ID
            title: "Order Accepted!",
            message: `Your order #${id.slice(-6).toUpperCase()} has been accepted and is being processed.`
          }
        });
      }

      return res.json({ success: true, message: "Order updated & notification sent!" });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Error updating order" });
    }
  }

  static async getMyNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, notifications });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
}