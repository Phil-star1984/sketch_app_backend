import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import sketchRoute from "./routes/sketchRoutes.js";
/* import { PrismaClient } from "@prisma/client"; */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const port = process.env.PORT || 3000;

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
  console.log(req.file.buffer);
  const newFilename = Date.now() + "_" + req.file.originalname;

  const params = {
    Bucket: bucketName,
    Key: newFilename,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  res.json({
    message: "Bild erfolgreich erhalten und in Amazon S3 gespeichert",
  });
});

// Route um alle Skizzen von Amazon S3 abzurufen
app.get("/uploads", async (req, res) => {
  const params = {
    Bucket: bucketName,
  };

  try {
    const command = new ListObjectsV2Command(params);
    const { Contents } = await s3.send(command);
    const urls = await Promise.all(
      Contents.map(async (file) => {
        const urlParams = {
          Bucket: bucketName,
          Key: file.Key,
        };
        const getUrlCommand = new GetObjectCommand(urlParams);
        const url = await getSignedUrl(s3, getUrlCommand, { expiresIn: 3600 }); // URL expires in 1 hour
        return { name: file.Key, url };
      })
    );

    res.json(urls);
  } catch (error) {
    console.error("Error fetching objects:", error);
    res.status(500).send("Failed to retrieve images from S3");
  }
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
