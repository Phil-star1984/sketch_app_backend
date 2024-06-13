import express from "express";
import cors from "cors";
import sketchRoute from "./routes/sketchRoutes.js";

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/sketches", sketchRoute); // Unified API endpoint

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
