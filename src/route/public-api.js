import express from "express";
import userController from "../controller/user-controller.js";
import authController from "../controller/auth-controller.js";
import productController from "../controller/product-controller.js";

const publicRouter = express.Router();

publicRouter.post("/users", userController.create);
publicRouter.post("/users/login", userController.login);
publicRouter.post("/users/logout", userController.logout);
publicRouter.post("/users/logout", userController.logout);
publicRouter.post("/users/refresh", authController.refresh);

publicRouter.get("/products", productController.search);

export default publicRouter;