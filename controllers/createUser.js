import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHanlder.js";
import {uploadToCloudinary} from "../utils/cloudinary.js";
import User from "../models/User.model.js";

// Helper function check size
const checkSize = (item) => {
  if (!item) return false; // Return false if the item is null or undefined
  const size_in_kb = item.length / 1024;
  return size_in_kb <= 400; // Return true if size <= 400 KB
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
    caste_no,
    isMinor,
  } = req.body;

  const address = {
    province: req.body["address[province]"],
    district: req.body["address[district]"],
    municipality: req.body["address[municipality]"],
  };

  // Validate address
  if (!address.district || !address.municipality || !address.province) {
    return res.status(404).json({
      message: "Address (province, district, municipality) is required",
      data: [],
    });
  }

  // Collect file data
  const avatarLocal = req.files?.avatar?.data;
  const frontLocal = req.files?.front?.data;
  const backLocal = req.files?.back?.data || null;

  // Validate files and sizes based on isMinor
  if (isMinor) {
    // Validation for minors (no backLocal required)
    if (!avatarLocal || !frontLocal) {
      return res.status(404).json({
        message:
          "Profile Picture and front identity image are required for minors",
        data: [],
      });
    }
    if (!checkSize(avatarLocal) || !checkSize(frontLocal)) {
      return res.status(404).json({
        message: "Image size should be less than 400 KB",
        data: [],
      });
    }
  } else {
    // Validation for non-minors (backLocal required)
    if (!avatarLocal || !frontLocal || !backLocal) {
      return res.status(404).json({
        message:
          "Profile Picture, front, and back identity images are required",
        data: [],
      });
    }
    if (
      !checkSize(avatarLocal) ||
      !checkSize(frontLocal) ||
      !checkSize(backLocal)
    ) {
      return res.status(404).json({
        message: "Image size should be less than 400 KB",
        data: [],
      });
    }
  }

  try {
    // Validation: Check required fields
    if (
      [name, DOB, caste_no, identity_no, email].some(
        (field) => typeof field === "string" && field.trim() === ""
      )
    ) {
      return res.status(404).json({
        message: "All fields are required",
        data: [],
      });
    }

    // Validation: Check for duplicate user
    const existedUser = await User.findOne({
      isMinor: isMinor,
      identity_no: identity_no,
    });
    if (existedUser) {
      return res.status(409).json({
        message: "User with the same identity number already exists",
        data: [],
      });
    }

    // Upload files to Cloudinary
    const avatar = await uploadToCloudinary(avatarLocal, "caste/avatar");
    const front = await uploadToCloudinary(frontLocal, "caste/front");
    const back = backLocal
      ? await uploadToCloudinary(backLocal, "caste/back")
      : null;

    if (!avatar || !front) {
      throw new ApiError(500, "Error uploading files to Cloudinary");
    }

    // Create user in the database
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
      .status(200)
      .json(new ApiResponse(200, user, "User registered successfully"));
  } catch (error) {
    // Handle any unexpected errors
    throw error; // Re-throw the error for centralized error handling
  }
});
const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Extract userId from the route
  const updates = req.body; // Extract fields to update from the request body
console.log("updates",updates)
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Find user by ID and update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates }, // Dynamically apply updates
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export { createUser,updateUser};
