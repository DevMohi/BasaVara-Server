import express, { Request, Response } from "express";
import userRouter from "./app/module/user/user.router";
import authRouter from "./app/module/auth/auth.router";
import { OrderRoutes } from "./app/module/order/order.routes";
import cookieParser from "cookie-parser";
import cors from "cors";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import adminRouter from "./app/module/admin/admin.router";
import { RentalHouseRoutes } from "./app/module/rentalHouse/rentalHouse.routes";
import { RentalRequestRoutes } from "./app/module/rentalRequest/rentalRequest.routes";

const app = express();
//parsers
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "https://property-pro-client.vercel.app",
    ],
    credentials: true,
  })
);

// middleware
app.use(express.json());

app.use("/auth", authRouter);

app.use("/landlords", RentalHouseRoutes);
app.use("/admin", adminRouter);

app.use("/user", userRouter);
app.use("/rental-requests", RentalRequestRoutes);

app.use("/order", OrderRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send({
    status: true,
    message: "Hello",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;

//push
