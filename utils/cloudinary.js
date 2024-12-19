import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import streamifier from 'streamifier'
  
const Cloudinary=async(localfile,folderName)=>{
 cloudinary.config({
   cloud_name: `${process.env.CLOUD_NAME}`,
   api_key: `${process.env.API_KEY}`,
   api_secret: `${process.env.API_SECRET}`, // Click 'View API Keys' above to copy your API secret
 });
   try {
    if(!localfile) return null
    const uploadResult=await cloudinary.uploader.upload(localfile,{
        resource_type:"auto",
        folder:`Caste/${folderName}`
    })
    fs.unlinkSync(localfile);
    return uploadResult.secure_url
   } catch (error) {
    fs.unlinkSync(localfile)
    console.log(error)
    return null
   }
}

const uploadToCloudinary = (buffer, folder) => {
   cloudinary.config({
     cloud_name: `${process.env.CLOUD_NAME}`,
     api_key: `${process.env.API_KEY}`,
     api_secret: `${process.env.API_SECRET}`, // Click 'View API Keys' above to copy your API secret
   });
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder }, // Specify folder in Cloudinary
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url); // Get the secure URL of the uploaded file
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};
export  {Cloudinary,uploadToCloudinary}