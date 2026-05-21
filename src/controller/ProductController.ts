import { Request, Response } from "express";
import prisma from "../config/db.config.js";
import { generateSKU } from "../utils/generateSKU.js";

class ProductController {

  // ================= ADMIN =================

  // ================= ADMIN CREATE OVERHAUL =================
  static async create(req: Request, res: Response) {
    try {
      const data = req.body;

      // Ensure itemType is checked as a required property constraint validation
      if (!data.name || !data.category || data.price == null) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      const images: string[] = Array.isArray(data.images) ? data.images : [];
      const sku = generateSKU(data.name, data.category);

      const product = await prisma.product.create({
        data: {
          name: data.name,
          category: data.category,
          subCategory: data.subCategory || "Women", // Default fallback bucket allocation safely
          itemType: data.itemType, // 🔥 Saved directly into your MongoDB documents
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
      console.error(err);
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

// ================= PUBLIC (STRICT PRODUCT NAME SEARCH ONLY 🔥) =================
  static async getPublicProducts(req: Request, res: Response) {
    try {
      const { q, category } = req.query;

      // 1. Normalize the category filter
      const normalizeCategory = (cat: any) => {
        if (!cat || cat === "all") return null;
        const map: Record<string, string> = {
          "1Gram Gold": "1Gram Gold Polished Jewellery",
          "1Gram Gold Polished Jewellery": "1Gram Gold Polished Jewellery",
          "Gold": "Gold",
          "Silver": "Silver",
        };
        return map[String(cat)] || String(cat);
      };

      const finalCategory = normalizeCategory(category);
      let whereClause: any = {};

      // 2. Category Tab match rule
      if (finalCategory) {
        whereClause.category = finalCategory;
      }

      // 3. STRICT RULE: Search string ko SIRF aur SIRF name field par match karein
      if (q && String(q).trim() !== "") {
        whereClause.name = {
          contains: String(q).trim(),
          mode: "insensitive" // 'rings' ya 'RINGS' dono automatically match honge
        };
      }

      const queryOptions: any = {
        where: whereClause,
        orderBy: { created_at: "desc" },
      };

      const products = await prisma.product.findMany(queryOptions);
      const banners = products.slice(0, 5); 

      let featured = null;
      if (banners && banners.length > 0) {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const diff = Math.floor((new Date().getTime() - startOfYear.getTime()) / 86400000);
        const index = diff % banners.length;
        featured = banners[index];
      }

      return res.json({
        success: true,
        products,
        banners,
        featured,
      });
    } catch (error) {
      console.error("Error in strict getPublicProducts:", error);
      return res.status(500).json({ message: "Internal server error" });
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

  static async getBannerProducts(req: Request, res: Response) {
    try {
      let { category } = req.query;

      const normalizeCategory = (cat: any) => {
        if (!cat || cat === "all") return null;
        const map: Record<string, string> = {
          "1Gram Gold": "1Gram Gold Polished Jewellery",
          "1Gram Gold Polished Jewellery": "1Gram Gold Polished Jewellery",
          Gold: "Gold",
          Silver: "Silver",
        };
        return map[String(cat)] || String(cat);
      };

      const finalCategory = normalizeCategory(category);
      let banners;

      if (finalCategory) {
        banners = await prisma.product.findMany({
          where: {
            category: finalCategory,
          },
          orderBy: { created_at: "desc" },
          take: 5,
        });
      } else {
        banners = await prisma.product.findMany({
          orderBy: { created_at: "desc" },
          take: 5,
        });
      }

      if (!banners || banners.length === 0) {
        return res.json({ banners: [], featured: null });
      }

      // Sequential Day Index calculated day-by-day
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      const diff = Math.floor((new Date().getTime() - startOfYear.getTime()) / 86400000);
      const index = diff % banners.length;

      return res.json({
        banners,
        featured: banners[index],
      });
    } catch (error) {
      console.error("Error in getBannerProducts:", error);
      return res.status(500).json({ message: "Banner error" });
    }
  }
}

export default ProductController;