import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";

// AWS S3 client setup
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

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to handle uploading a sketch
export const uploadSketch = upload.single("image"); // This is a middleware function now

export const processUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const newFilename = Date.now() + "_" + req.file.originalname;
  const params = {
    Bucket: bucketName,
    Key: newFilename,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(params));
    res.json({
      message: "Image successfully uploaded and stored in Amazon S3",
      url: `/uploads/${newFilename}`,
    });
  } catch (error) {
    console.error("Error uploading to S3:", error);
    res.status(500).send("Failed to upload image to S3");
  }
};

// Function to list all sketches
export const getAllSketches = async (req, res) => {
  const params = {
    Bucket: bucketName,
  };

  try {
    const { Contents } = await s3.send(new ListObjectsV2Command(params));
    const urls = await Promise.all(
      Contents.map(async (file) => {
        const urlParams = {
          Bucket: bucketName,
          Key: file.Key,
        };
        const url = await getSignedUrl(s3, new GetObjectCommand(urlParams), {
          expiresIn: 3600,
        });
        return { name: file.Key, url };
      })
    );
    res.json(urls);
  } catch (error) {
    console.error("Error fetching objects from S3:", error);
    res.status(500).send("Failed to retrieve images from S3");
  }
};

export const deleteSketch = async (req, res) => {
  const { sketchId } = req.params;
  console.log(sketchId);

  const command = {
    Bucket: bucketName,
    Key: sketchId,
  };

  try {
    const response = await s3.send(new DeleteObjectCommand(command));
    // Check if the HTTP status code exists in the metadata
    const statusCode =
      response["$metadata"] && response["$metadata"].httpStatusCode
        ? response["$metadata"].httpStatusCode
        : 200; // Default to 200 if not found

    res
      .status(200)
      .send({ message: `Success: deleting file ${sketchId} from server` });
  } catch (error) {
    console.error("Failed to delete from Amazon S3 Bucket:", error);
    res.status(500).send("Failed to delete sketch");
  }
};
