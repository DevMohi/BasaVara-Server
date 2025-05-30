import mongoose from "mongoose";
import { TRentalHouse } from "./rentalHouse.interface";
import { RentalHouseModel } from "./rentalHouse.model";
import AppError from "../../helpers/error";
import { StatusCodes } from "http-status-codes";
import { IImageFiles } from "../../middlewares/interface/IImageFile";
import User from "../user/user.model";
import { RentalRequestModel } from "../rentalRequest/rentalRequest.model";
import { query } from "express";
import QueryBuilder from "../../builder/querybuilder";

// Create a new rental house listing
const createRentalHouseInDB = async (
  rentalHouseData: Partial<TRentalHouse>,
  imageFiles: IImageFiles
) => {
  const { images } = imageFiles;
  if (!images || images.length === 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Images are required.");
  }

  rentalHouseData.imageUrls = images.map((image) => image.path);
  const result = await RentalHouseModel.create(rentalHouseData);
  return result;
};

const getAllRentalHousesFromDB = async (query: Record<string, unknown>) => {
  const rentalHouseQuery = new QueryBuilder(
    RentalHouseModel.find(),
    query
  ).paginate();

  const result = await rentalHouseQuery.modelQuery;
  const meta = await rentalHouseQuery.countTotal();

  return {
    meta,
    result,
  };
};
// const getLandlordRentalHouses = async (landlordId: string) => {

//   const result = await RentalHouseModel.find({ landlordId }).populate(
//     "landlordId"
//   );
//   return result;
// };

const getLandlordRentalHouses = async (
  landlordId: string,
  query: Record<string, unknown>
) => {
  const rentalHouseQuery = new QueryBuilder(
    RentalHouseModel.find({ landlordId }),
    query
  ).paginate();

  const result = await rentalHouseQuery.modelQuery.populate("landlordId");
  const meta = await rentalHouseQuery.countTotal();

  return { result, meta };
};

const getSingleRentalHouseFromDB = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const result = await RentalHouseModel.findById(id).populate("landlordId");
  return result;
};

// Update listing by ID
const updateRentalHouseInDB = async (
  rentalHouseId: string,
  updatedData: Partial<TRentalHouse>
) => {
  const result = await RentalHouseModel.findByIdAndUpdate(
    rentalHouseId,
    updatedData,
    { new: true, runValidators: true }
  );

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "Rental house not found");
  }

  return result;
};

// Delete a listing by ID
const deleteRentalHouseFromDB = async (
  id: string
): Promise<TRentalHouse | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null; // If the ID is not valid, return null
  }

  // Use findByIdAndDelete to delete by ID
  const deletedRentalHouse = await RentalHouseModel.findByIdAndDelete(id);

  return deletedRentalHouse; // Will return null if not found, or the deleted house data
};

// Respond to a rental request (approve/reject)
const respondToRentalRequestDB = async (
  requestId: string,
  status: "Approved" | "Rejected",
  userId: string,
  phoneNumber?: string
) => {
  const rentalRequest = await RentalRequestModel.findById(requestId);

  if (!rentalRequest) {
    throw new AppError(400, "Rental request not found");
  }

  const rentalHouse = await RentalHouseModel.findById(
    rentalRequest.rentalHouseId
  );
  if (!rentalHouse) {
    throw new AppError(400, "Rental house not found");
  }

  const landlord = await User.findById(rentalHouse.landlordId);
  if (!landlord) {
    throw new AppError(400, "Landlord not found");
  }

  // Authorization check: only the actual landlord can respond
  if (String(rentalHouse.landlordId) !== String(userId)) {
    throw new AppError(
      403,
      "You are not authorized to respond to this request"
    );
  }

  const finalPhoneNumber = landlord.phone || phoneNumber;
  if (status === "Approved" && !finalPhoneNumber) {
    throw new AppError(400, "Phone number is required to approve this request");
  }

  rentalRequest.status = status;
  if (status === "Approved") {
    rentalRequest.phone = finalPhoneNumber;
  }

  await rentalRequest.save();

  return rentalRequest;
};

export const RentalHouseServices = {
  createRentalHouseInDB,
  getAllRentalHousesFromDB,
  getSingleRentalHouseFromDB,
  updateRentalHouseInDB,
  deleteRentalHouseFromDB,
  getLandlordRentalHouses,
  respondToRentalRequestDB,
};
