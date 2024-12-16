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
  const { identity_no, isMinor } = req.query; // Access query parameters from req.query

  // Check if identity_no or isMinor is missing
  if (!identity_no || !isMinor) {
    throw new ApiError(400, "Check identity number or minor status");
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
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User found successfully"));
});


export {getUsers,getUser}