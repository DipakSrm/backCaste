import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import createUser from "./routes/createUser.route.js";
import  getUser  from "./routes/getUser.route.js";
import connectDB from "./db.js";
import fileUpload from "express-fileupload";
import getFamily from "./routes/getFamily.route.js"
import getTree from "./routes/getHirarchy.route.js"
// Initialize app and configure environment
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON requests
app.use(fileUpload());
// Basic test route
app.get("/", (req, res) => {
    console.log("Server hit")
  res.status(200).json({ message: "Server is running!" });
});

// Connect to database and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection failed:", err.message);
  });

// Add API routes
app.use("/api/v1", createUser);
app.use("/api/v1", getUser);
app.use("/api/v1", getFamily);
app.use("/api/v1", getTree);
