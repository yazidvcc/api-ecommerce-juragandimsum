import express from "express";
import userController from "../controller/user-controller.js";

const publicRouter = express.Router();

publicRouter.post("/users", userController.create);

export default publicRouter;