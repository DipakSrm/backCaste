import mongoose from "mongoose";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHanlder.js";
import Cloudinary from "../utils/cloudinary.js";
import User from "../models/User.model.js";

// Helper function to clean up files
const cleanUpFiles = (filePaths) => {
  filePaths.filter(Boolean).forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
};

const createUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    DOB,
    identity_no,
    fatherId,
    grandfatherId,
    gender,
    address,
    caste_no,
    isMinor,
  } = req.body;

  // Collect file paths for cleanup later
  const avatarLocal = req.files?.avatar?.[0]?.path;
  const frontLocal = req.files?.front?.[0]?.path;
  const backLocal = req.files?.back?.[0]?.path || null;
  const filePaths = [avatarLocal, frontLocal, backLocal];

  try {
    // Validation: Check required fields
    if (
      [name, DOB, address, caste_no, identity_no, email].some(
        (field) => typeof field === "string" && field.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }

    // Validation: Check for duplicate user
    const existedUser = await User.findOne({ 
      isMinor:isMinor,
      identity_no:identity_no
     });
    if (existedUser) {
      throw new ApiError(409, "User with the same identity number exists");
    }

    // Validation: Check required files
    if (!avatarLocal || !frontLocal) {
      throw new ApiError(400, "Avatar and Front Identity files are required");
    }

    // Upload files to Cloudinary
    const avatar = await Cloudinary(avatarLocal);
    const front = await Cloudinary(frontLocal);
    const back = backLocal ? await Cloudinary(backLocal) : null;

    if (!avatar || !front) {
      throw new ApiError(500, "Error uploading files to Cloudinary");
    }

    // Create user in database
    const user = await User.create({
      name,
      email,
      DOB,
      isMinor,
      fatherId,
      grandfatherId,
      gender,
      address,
      avatar,
      caste_no,
      identity_no,
      identity_image: {
        front,
        back,
      },
    });

    // Respond with success
    return res
      .status(201)
      .json(new ApiResponse(200, user, "User registered successfully"));
  } catch (error) {
    // Clean up local files on error
    cleanUpFiles(filePaths);

    // Re-throw the error for centralized error handling
    throw error;
  }
});

export { createUser};
