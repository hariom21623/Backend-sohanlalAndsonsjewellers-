import  jwt from 'jsonwebtoken';
import { Request, Response , NextFunction} from "express";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log("❌ Auth Header missing!"); // Debug log
        return res.status(401).json({ message: "UnAuthorized" });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET as string, (err, payload) => {
        if (err) {
            console.log("❌ Token Verification Failed:", err); // Debug log
            return res.status(401).json({ message: "UnAuthorized" });
        }
        (req as any).user = payload; 
        console.log("✅ Auth Success, moving to next()"); // Debug log
        next(); // YE CALL HONA HI CHAHIYE
    });
};

export default authMiddleware;