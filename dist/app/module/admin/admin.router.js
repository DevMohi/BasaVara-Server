"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_constants_1 = require("../user/user.constants");
const admin_controller_1 = require("./admin.controller");
const adminRouter = (0, express_1.Router)();
adminRouter.get("/listings", (0, auth_1.default)(user_constants_1.USER_ROLE.admin), admin_controller_1.adminController.getAllHousesByAdmin);
adminRouter.get("/users", (0, auth_1.default)(user_constants_1.USER_ROLE.admin), admin_controller_1.adminController.getAllUsersByAdmin);
adminRouter.get("/rental-transactions", (0, auth_1.default)(user_constants_1.USER_ROLE.admin), admin_controller_1.adminController.getAllRentalTransactions);
adminRouter.get("/summary", (0, auth_1.default)(user_constants_1.USER_ROLE.admin), admin_controller_1.adminController.userSummary);
adminRouter.patch("/user/:id", (0, auth_1.default)(user_constants_1.USER_ROLE.admin), admin_controller_1.adminController.userDeleteByAdmin);
// adminRouter.patch(
//   "/listings/:id",
//   auth(USER_ROLE.admin),
//   multerUpload.fields([{ name: "images" }]),
//   parseBody,
//   ProductControllers.updateProduct
// );
exports.default = adminRouter;
