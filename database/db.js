import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
const mongodbUri = process.env.MONGODB_URI;

const databaseConnection = function (callback) {
    mongoose
        .connect(mongodbUri)
        .then((res) => {

            console.log("database connected");
            callback();
        })
        .catch((err) => {
            console.log(err);
        });
};

export default databaseConnection;
