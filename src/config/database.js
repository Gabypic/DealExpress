import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoURI = "mongodb+srv://cous:1234@cluster0.7cvs1o1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI, { })
    .then(() => console.log("MongoDB connected"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

export default mongoose;
