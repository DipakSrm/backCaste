import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHanlder.js";
import {uploadToCloudinary} from "../utils/cloudinary.js";
import User from "../models/User.model.js";

// Helper function to clean up files

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
if(!address){
    return res.status(404).json({ message: "Address is required", data: [] });
}
  // Collect file paths for cleanup later
  const avatarLocal = req.files?.avatar?.data;
  const frontLocal = req.files?.front?.data;
  const backLocal = req.files?.back?.data || null;

  try {
    // Validation: Check required fields
    if (
      [name, DOB, caste_no, identity_no, email].some(
        (field) => typeof field === "string" && field.trim() === ""
      )
    ) {
      return res
        .status(404)
        .json({ message: "All fields required", data: [] });
    }

    // Validation: Check for duplicate user
    const existedUser = await User.findOne({ 
      isMinor:isMinor,
      identity_no:identity_no
     });
    if (existedUser) {
      return res.status(409).json(
       { message:"User with same identity exist",data:[]}
      )
    }

    // Validation: Check required files
    if (!avatarLocal || !frontLocal) {
      throw new ApiError(400, "Avatar and Front Identity files are required");
    }

    // Upload files to Cloudinary
    const avatar = await uploadToCloudinary(avatarLocal,"caste/avatar");
    const front = await uploadToCloudinary(frontLocal,'caste/front');
    const back = backLocal ? await uploadToCloudinary(backLocal,'caste/back') : null;

    if (!avatar || !front) {
      throw new ApiError(500, "Error uploading files to uploadToCloudinary");
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
      .status(200)
      .json(new ApiResponse(200, user, "User registered successfully"));
  } catch (error) {
    // Clean up local files on error

    // Re-throw the error for centralized error handling
    throw error;
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
