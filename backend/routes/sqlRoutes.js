const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadSql, analyzeQueries } = require("../controllers/sqlControllers");

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/plain" || file.originalname.endsWith(".sql")) {
      cb(null, true);
    } else {
      cb(new Error("Only SQL files are allowed"));
    }
  },
});

router.post("/upload", upload.array("files"), uploadSql);
router.get("/analyze", analyzeQueries);

module.exports = router;
