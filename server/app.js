import express from "express";
import cors from "cors";
import multer from "multer";
import pkg from "dotenv";
import { mainsend } from "./chunk.js";
import { mainretrieve } from "./retrieve.js";
import { buffer } from "stream/consumers";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 1234;

app.use(cors());
app.use(express.json());
const upload = multer();

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const botToken = req.body.botToken;
    const channelId = req.body.channelId;

    const { fileHash } = await mainsend(channelId, botToken, req.file.buffer);

    res.status(200).json({
      message: "File uploaded successfully",
      fileDetails: {
        filename: req.file.originalname,
        filehash: fileHash,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Server error during upload" });
  }
});

app.get("/api/retrieve/:fileHash", async (req, res) => {
  try {
    const { fileHash } = req.params;
    const { fileSize, fileName, botToken, channelId } = req.query;

    const file = await mainretrieve(channelId, fileHash, botToken, fileSize);

    console.log(fileName);

    res.status(200).send(file);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).json({ error: "Failed to retrieve file" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
