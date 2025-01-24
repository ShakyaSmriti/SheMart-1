import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MongoDB_URL, {
      dbName: "Shemart", // Specify the database name here
    });
    console.log("DB Connected Successfully");
  } catch (error) {
    console.error("Error connecting to DB:", error.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
