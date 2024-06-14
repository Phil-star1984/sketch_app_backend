import express from "express";
import {
  getAllSketches,
  uploadSketch,
  processUpload,
  deleteSketch,
} from "../controllers/sketchController.js";

const sketchRoute = express.Router();

sketchRoute.route("/").get(getAllSketches).post(uploadSketch, processUpload);
sketchRoute.route("/:sketchId").delete(deleteSketch);

export default sketchRoute;
