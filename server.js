import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";

const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generieren eines einzigartigen Namens mit einem Zeitstempel
    const uniqueSuffix = Date.now() + "_" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.json({ response: "Server works" });
});

app.post("/skizzen", upload.single("image"), (req, res) => {
  console.log("Bild erhalten:", req.file.path);
  // Hier könntest du den Pfad des Bildes in der Datenbank speichern oder direkt eine URL zurückgeben
  res.json({
    message: "Bild erfolgreich erhalten und gespeichert",
    filePath: req.file.path,
  });
});

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
