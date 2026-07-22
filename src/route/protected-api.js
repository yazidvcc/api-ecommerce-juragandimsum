import express from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import productController from "../controller/product-controller.js";
import roleMiddleware from "../middleware/role-middleware.js";
import cartController from "../controller/cart-controller.js";
import orderController from "../controller/order-controller.js";
import bannerController from "../controller/banner-controller.js";
import userController from "../controller/user-controller.js";

const protectedRouter = express.Router();

protectedRouter.use(authMiddleware);

protectedRouter.get("/users", roleMiddleware(["ADMIN","CUSTOMER"]), userController.get)

protectedRouter.post("/products", roleMiddleware(["ADMIN"]),productController.create);
protectedRouter.patch("/products/:productId", roleMiddleware(["ADMIN"]),productController.update);
protectedRouter.post("/products/:productId/photo", roleMiddleware(["ADMIN"]), productController.createPhoto);
protectedRouter.delete("/products/:productId/photo/:photoProductId", productController.removePhoto)
protectedRouter.delete("/products/:productId", roleMiddleware(["ADMIN"]),productController.remove);

protectedRouter.post("/carts", roleMiddleware(["CUSTOMER"]) ,cartController.create);
protectedRouter.patch("/carts/:cartId", roleMiddleware(["CUSTOMER"]),cartController.update);
protectedRouter.get("/carts", roleMiddleware(["CUSTOMER"]) ,cartController.get);
protectedRouter.delete("/carts/:cartId", roleMiddleware(["CUSTOMER"]) ,cartController.remove);

protectedRouter.post("/orders", roleMiddleware(["CUSTOMER"]) ,orderController.create);
protectedRouter.get("/orders/statistict", roleMiddleware(["ADMIN"]), orderController.statistictOder);
protectedRouter.post("/orders/:orderId/shipping-cost", roleMiddleware(["ADMIN"]) ,orderController.shippingCost);
protectedRouter.post("/orders/:orderId/payment", roleMiddleware(["CUSTOMER"]) ,orderController.tokenTransaction);
protectedRouter.get("/orders", roleMiddleware(["CUSTOMER","ADMIN"]), orderController.search);
protectedRouter.get("/orders/:orderId", roleMiddleware(["CUSTOMER","ADMIN"]), orderController.get);
protectedRouter.post("/orders/:orderId/status", roleMiddleware(["ADMIN","CUSTOMER"]), orderController.handleStatus);

protectedRouter.post("/banners", roleMiddleware(["ADMIN"]), bannerController.create);
protectedRouter.delete("/banners/:idBanner", roleMiddleware(["ADMIN"]), bannerController.remove);

export default protectedRouter;