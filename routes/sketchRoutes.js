import express from "express";
import {
  getAllSketches,
  uploadSketch,
} from "../controllers/sketchController.js";

const sketchRoute = express.Router();

sketchRoute.route("/").get(getAllSketches).post(uploadSketch);

export default sketchRoute;
