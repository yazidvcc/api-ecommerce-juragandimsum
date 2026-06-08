import express from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import productController from "../controller/product-controller.js";
import roleMiddleware from "../middleware/role-middleware.js";

const protectedRouter = express.Router();

protectedRouter.use(authMiddleware);

protectedRouter.post("/products", roleMiddleware(["ADMIN"]),productController.create);
protectedRouter.patch("/products/:productId", roleMiddleware(["ADMIN"]),productController.update);

export default protectedRouter;