// require('dotenv').config({path : './env'})
// import mongoose, { connect } from "mongoose";
// import { DB_NAME } from "../src/constants.js";

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("before listen App error", error);
      throw error;
    });
    app.listen(process.env.PORT || 8001, () => {
      console.log(`Server is running at port  : ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGO DB Connection failed  !! : ", error);
  });

/*
import express from "express";
const app = express()(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI} / ${DB_NAME}`);
    app.on("error", (error) => {
      console.log("over express app not talk to database");
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("we got error ", error);
    throw error;
  }
})();
*/
