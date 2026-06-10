import express from "express";
import userController from "../controller/user-controller.js";
import authController from "../controller/auth-controller.js";
import productController from "../controller/product-controller.js";
import addressContoller from "../controller/address-contoller.js";

const publicRouter = express.Router();

publicRouter.post("/users", userController.create);
publicRouter.post("/users/login", userController.login);
publicRouter.post("/users/logout", userController.logout);
publicRouter.post("/users/logout", userController.logout);
publicRouter.post("/users/refresh", authController.refresh);

publicRouter.get("/products", productController.search);
publicRouter.get("/products/:productId", productController.get);

publicRouter.get("/address/province", addressContoller.province);
publicRouter.get("/address/city/:provinceId", addressContoller.city);
publicRouter.get("/address/district/:cityId", addressContoller.district);
publicRouter.get("/address/subdistrict/:districtId", addressContoller.subdistrict);

export default publicRouter;