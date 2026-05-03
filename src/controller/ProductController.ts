import { Request, Response } from "express";
import prisma from "../config/db.config.js";
import { generateSKU } from "../utils/generateSKU.js";

class ProductController {
  // ================= ADMIN =================

  static async create(req: Request, res: Response) {
    try {
      const data = req.body;

      if (!data.name || !data.category || data.price == null) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      const images: string[] = Array.isArray(data.images) ? data.images : [];
      const sku = generateSKU(data.name, data.category);

      const product = await prisma.product.create({
        data: {
          name: data.name,
          category: data.category,
          subCategory: data.subCategory || "",
          price: Number(data.price),
          weight: Number(data.weight || 0),
          description: data.description || "",
          images,
          sku,
          stock: Number(data.stock || 0),
        },
      });

      return res.json({ success: true, product });
    } catch (err) {
      console.error("Create product error:", err);
      return res.status(500).json({ success: false });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany({
        orderBy: { created_at: "desc" },
      });

      return res.json({ success: true, products });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({ where: { id } });

      if (!product) {
        return res.status(404).json({ success: false, message: "Not found" });
      }

      return res.json({ success: true, product });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.price) updates.price = Number(updates.price);
      if (updates.stock) updates.stock = Number(updates.stock);

      const product = await prisma.product.update({
        where: { id },
        data: updates,
      });

      return res.json({ success: true, product });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.product.delete({ where: { id } });

      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
  }

  // ================= PUBLIC (SAFE) =================

  static async getPublicProducts(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany({
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          sku: true,
          category: true,
        },
      });

      return res.json({ success: true, products });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
  }

  static async getPublicProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          description: true,
          category: true,
          sku: true,
        },
      });

      if (!product) {
        return res.status(404).json({ success: false });
      }

      return res.json({ success: true, product });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
  }
}

export default ProductController;