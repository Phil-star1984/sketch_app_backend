import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
const port = 3000;

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

app.post("/skizzen", upload.single("image"), (req, res) => {
  console.log("Bild erhalten:", req.file.path);
  // Hier könntest du den Pfad des Bildes in der Datenbank speichern oder direkt eine URL zurückgeben
  res.json({
    message: "Bild erfolgreich erhalten und gespeichert",
    filePath: req.file.path,
  });
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
