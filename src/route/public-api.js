import express from "express";
import userController from "../controller/user-controller.js";
import authController from "../controller/auth-controller.js";
import productController from "../controller/product-controller.js";
import addressContoller from "../controller/address-contoller.js";
import orderController from "../controller/order-controller.js";
import bannerController from "../controller/banner-controller.js";
import { authLimiter } from "../application/rate-limit.js";

const publicRouter = express.Router();

publicRouter.post("/users", userController.create);
publicRouter.post("/users/login", authLimiter, userController.login);
publicRouter.post("/users/logout", userController.logout);
publicRouter.post("/users/refresh", authController.refresh);

publicRouter.get("/products", productController.search);
publicRouter.get("/products/statistict", productController.statistictProduct);
publicRouter.get("/products/:productId", productController.get);

publicRouter.get("/address/province", addressContoller.province);
publicRouter.get("/address/city/:provinceId", addressContoller.city);
publicRouter.get("/address/district/:cityId", addressContoller.district);
publicRouter.get("/address/subdistrict/:districtId", addressContoller.subdistrict);

publicRouter.post("/orders/payment-notification-handler", orderController.getNotification);

publicRouter.get("/banners", bannerController.search);
publicRouter.get("/banners/:bannerId", bannerController.get);

export default publicRouter;