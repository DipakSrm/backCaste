import mongoose from "mongoose";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHanlder.js";
import User from "../models/User.model.js";
const getUsers = asyncHandler(async (req, res) => {
    const users=await User.find().sort({createdAt:-1})
    if(!users){
       return  res.status(400).json({
            data:users,message:"No users found"
        })
    }
    return res.status(200).json(
        new ApiResponse(200,users,"Users fetched successfully")
    )
});
const getUser = asyncHandler(async (req, res) => {
  try {
    const { identity_no, isMinor } = req.query; // Access query parameters from req.query

    // Validate query parameters
    if (!identity_no || !isMinor) {
      return res.status(400).json({
        data: null,
        message: "Missing required parameters: Identity Number",
      });
    }

    // Find the user based on identity_no and isMinor
    const user = await User.findOne({
      isMinor: isMinor,
      identity_no: identity_no,
    });

    // If no user is found, return a 404 response
    if (!user) {
      return res.status(404).json({
        data: null,
        message: "No such user found",
      });
    }

    // Return the found user with a 200 status code
    return res.status(200).json({
      status: 200,
      data: user,
      message: "User found successfully",
    });
  } catch (error) {
    console.error("Error in getUser:", error); // Log the error for debugging

    // Return a 500 status for server errors
    return res.status(500).json({
      data: null,
      message: "Internal Server Error",
    });
  }
});



export {getUsers,getUser}