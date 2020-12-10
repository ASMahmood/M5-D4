const express = require("express");
const multer = require("multer");
const { writeFile, createReadStream } = require("fs-extra");
const { pipeline } = require("stream");
const { join } = require("path");

const router = express.Router();

const upload = multer({});

const projectsImagePath = join(__dirname, "../../public/img/projects");

router.post("/", upload.single("projectImg"), async (req, res, next) => {
  console.log(req.params.id);
  console.log(req.file.originalname);
  try {
    await writeFile(
      join(projectsImagePath, req.file.originalname),
      req.file.buffer
    );
    res.send("ok");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
