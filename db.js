import mongoose from "mongoose";
const connectDB=async ()=>{
    try {
        const connection=await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log("Mongodb connection successfull")
    } catch (error) {
        console.log(error)
    }
}
export default connectDB