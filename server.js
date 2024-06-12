import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import sketchRoute from "./routes/sketchRoutes.js";
/* import { PrismaClient } from "@prisma/client"; */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

/* const prisma = new PrismaClient(); */

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfiguration für Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route zum testen
app.use("/api/sketches", sketchRoute);

// Route um Skizzen im File Sytem zu speichern
app.post("/skizzen", upload.single("image"), async (req, res) => {
  console.log(req.file.path);
  console.log(req.body);
  console.log(req.file.buffer);

  req.file.buffer;

  const params = {
    Bucket: bucketName,
    Key: req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  res.json({
    message: "Bild erfolgreich erhalten und gespeichert",
    filePath: req.file.path,
    buffer: req.file.buffer,
  });
});

// Route um alle Skizzen im File Sytem abzurufen
app.get("/uploads", (req, res) => {
  fs.readdir(path.join(__dirname, "uploads"), (err, files) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to list files" });
      return;
    }
    const baseURL = `${req.protocol}://${req.get("host")}`;
    res.json({
      files: files.map((file) => `${baseURL}/uploads/${file}`),
    });
  });
});

// Um die gespeicherten statischen Bilder im Frontend anzuzeigen
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
