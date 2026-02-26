import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI as string,
      {
        serverSelectionTimeoutMS: 5000, // fail fast
      }
    );

    console.log("MongoDB connected 🟢");
    return conn;
  } catch (error) {
    console.error("MongoDB connection error 🔴", error);
    throw error;
  }
};

export default connectDB;