import { Request, Response } from "express";
import  bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import  jwt from "jsonwebtoken";

class AuthController {
  // ------------------ REGISTER ------------------
  static async register(req: Request, res: Response) {
    try {
      const payload = req.body;

      // Always force adminRole to false
      payload.adminRole = false;

      // Check duplicate email
      const existingEmail = await prisma.user.findUnique({
        where: { email: payload.email },
      });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists!" });
      }

      // Check duplicate phone number
      const existingPhone = await prisma.user.findUnique({
        where: { phoneNumber: payload.phoneNumber },
      });
      if (existingPhone) {
        return res
          .status(400)
          .json({ message: "Phone number already exists!" });
      }

      // Hash password
      const salt = bcrypt.genSaltSync(10);
      payload.password = bcrypt.hashSync(payload.password, salt);

      // Create user
      const user = await prisma.user.create({
        data: payload,
      });

      return res.json({
        message: "Account created successfully!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          adminRole: user.adminRole,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Something went wrong. Please try again." });
    }
  }

  // ------------------ LOGIN ------------------
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare passwords
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // JWT Payload
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        adminRole: user.adminRole,
      };

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error("JWT_SECRET missing in environment variables");
      }

      // Create token
      const token = jwt.sign(payload, jwtSecret, { expiresIn: "365d" });

      return res.json({
        message: "Logged in successfully!",
        user: payload,
        token, // no "Bearer" prefix
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Something went wrong." });
    }
  }

  // ------------------ GET AUTH USER ------------------
//   static async user(req: Request, res: Response) {
//     return res.status(200).json({ user: req.user });
//   }

//   //getAllUsers
//   static async getAllUsers(req: Request, res: Response) {
//   try {
//     const users = await prisma.user.findMany({
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         phoneNumber: true,
//         adminRole: true,
//         created_at: true
//       }
//     });

//     return res.json(users);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Something went wrong." });
//   }
// }

}

export default AuthController;
