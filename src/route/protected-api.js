import express from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";

const protectedRouter = express.Router();

protectedRouter.use(authMiddleware);

export default protectedRouter;