import { Request, Response } from "express";
import prisma from "../config/db.config.js";
import { generateSKU } from "../utils/generateSKU.js";

class ProductController {
  static async create(req: Request, res: Response) {
    try {
      const data = req.body;

      // validate minimal fields (you can expand as needed)
      if (!data.name || !data.category || data.price == null) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      // ensure images is an array of strings (base64 URIs)
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

      return res.json({ success: true, message: "Product created", product });
    } catch (err) {
      console.error("Create product error:", err);
      return res.status(500).json({ success: false, message: "Something went wrong." });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany({ orderBy: { created_at: "desc" }});
      return res.json({ success: true, products, total: products.length });
    } catch (err) {
      console.error("Get all products:", err);
      return res.status(500).json({ success: false, message: "Something went wrong." });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({ where: { id }});
      if (!product) return res.status(404).json({ success: false, message: "Not found" });
      return res.json({ success: true, product });
    } catch (err) {
      console.error("Get product by id:", err);
      return res.status(500).json({ success: false, message: "Something went wrong." });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body || {};

      // allow partial updates; convert numeric fields
      if (updates.price !== undefined) updates.price = Number(updates.price);
      if (updates.weight !== undefined) updates.weight = Number(updates.weight);
      if (updates.stock !== undefined) updates.stock = Number(updates.stock);

      // If images present, ensure array of strings
      if (updates.images && !Array.isArray(updates.images)) {
        return res.status(400).json({ success: false, message: "images must be an array" });
      }

      const updated = await prisma.product.update({
        where: { id },
        data: updates,
      });

      return res.json({ success: true, message: "Product updated", product: updated });
    } catch (err) {
      console.error("Update product:", err);
      return res.status(500).json({ success: false, message: "Something went wrong." });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.product.delete({ where: { id }});
      return res.json({ success: true, message: "Product deleted" });
    } catch (err) {
      console.error("Delete product:", err);
      return res.status(500).json({ success: false, message: "Something went wrong." });
    }
  }

  //User Listing
  static async getAllPublic(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany({ orderBy: { created_at: "desc" }});
      return res.json({ success: true, products, total: products.length });
    } catch (err) {
      console.error("Get all products:", err);
      return res.status(500).json({ success: false, message: "Something went wrong." });
    }
  }

  static async getByIdPublic(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({ where: { id }});
      if (!product) return res.status(404).json({ success: false, message: "Not found" });
      return res.json({ success: true, product });
    } catch (err) {
      console.error("Get product by id:", err);
      return res.status(500).json({ success: false, message: "Something went wrong." });
    }
  }
}

export default ProductController;
