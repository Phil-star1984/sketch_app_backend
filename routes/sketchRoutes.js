import express from "express";
import {
  getAllSketches,
  uploadSketch,
  processUpload,
} from "../controllers/sketchController.js";

const sketchRoute = express.Router();

sketchRoute.route("/").get(getAllSketches).post(uploadSketch, processUpload);

export default sketchRoute;
