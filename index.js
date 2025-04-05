import express from "express";
import multer from "multer";
import { rename } from "fs/promises";

const app = express();

const upload = multer({ dest: "uploads"});

app.use(express.static("public"))

app.post("/upload", upload.single("photostrip"), (req, res) => {
  rename(req.file.path, "uploads/" + new Date().toISOString() + ".png");
  res.send(200);
})

app.listen(8000);

