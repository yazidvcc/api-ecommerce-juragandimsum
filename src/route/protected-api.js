import express from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import productController from "../controller/product-controller.js";
import roleMiddleware from "../middleware/role-middleware.js";
import cartController from "../controller/cart-controller.js";
import orderController from "../controller/order-controller.js";

const protectedRouter = express.Router();

protectedRouter.use(authMiddleware);

protectedRouter.post("/products", roleMiddleware(["ADMIN"]),productController.create);
protectedRouter.patch("/products/:productId", roleMiddleware(["ADMIN"]),productController.update);
protectedRouter.delete("/products/:productId", roleMiddleware(["ADMIN"]),productController.remove);

protectedRouter.post("/carts", roleMiddleware(["CUSTOMER"]) ,cartController.create);
protectedRouter.get("/carts", roleMiddleware(["CUSTOMER"]) ,cartController.get);
protectedRouter.delete("/carts/:cartId", roleMiddleware(["CUSTOMER"]) ,cartController.remove);

protectedRouter.post("/orders", roleMiddleware(["CUSTOMER"]) ,orderController.create);
protectedRouter.post("/orders/:orderId/shipping-cost", roleMiddleware(["ADMIN"]) ,orderController.shippingCost);
protectedRouter.post("/orders/:orderId/payment", roleMiddleware(["CUSTOMER"]) ,orderController.tokenTransaction);

export default protectedRouter;