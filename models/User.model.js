import mongoose, { model, Schema, Types } from "mongoose";

const addressSchema=new Schema({
    province:{
        type:String,
        required:true,
        trim:true
    },
    district:{
        type:String,
        required:true,
        trim:true
    },
    municipality:{
        type:String,
        required:true,
        trim:true
    }
})
const identity_image=new Schema({
  front:{
    type:String,
    required:true
  },
  back:{
    type:String,
    default:null
  }
})

const userSchema = new Schema(
    {
  name: {
    type: String,
    required: true,
  },
  identity_no:{
type:String,
required:true
  },
  email: {
    type: String,
    required: true,
  },
  DOB: {
    type: Date,
    required: true,
  },
  fatherId: {
    type: Types.ObjectId,
    ref: "User",
    default: null,
  },
  isMinor:{
type:Boolean,
default:false
  },
  grandfatherId: {
    type: Types.ObjectId,
    ref: "User",
    default: null,
  },
  gender:{
    type:String,
    default:'Male'
  },
  address:{
type:addressSchema,
required:true
  },
  avatar:{
    type:String,
    required:true
  },
  caste_no:{
    type:Number,
    required:true
  },
  identity_image:{
    type:identity_image,
  required:true
  }
},
  {
    timestamps:true
  }
);
const User=model('User',userSchema)
export default User