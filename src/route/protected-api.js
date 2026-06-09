import express from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import productController from "../controller/product-controller.js";
import roleMiddleware from "../middleware/role-middleware.js";
import cartController from "../controller/cart-controller.js";

const protectedRouter = express.Router();

protectedRouter.use(authMiddleware);

protectedRouter.post("/products", roleMiddleware(["ADMIN"]),productController.create);
protectedRouter.patch("/products/:productId", roleMiddleware(["ADMIN"]),productController.update);
protectedRouter.delete("/products/:productId", roleMiddleware(["ADMIN"]),productController.remove);

protectedRouter.post("/carts", roleMiddleware(["CUSTOMER"]) ,cartController.create);
protectedRouter.get("/carts", roleMiddleware(["CUSTOMER"]) ,cartController.get);

export default protectedRouter;