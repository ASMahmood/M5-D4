const express = require("express");
const { writeFile, createReadStream } = require("fs-extra");
const multer = require("multer");
const { pipeline } = require("stream");
const { readDB, writeDB } = require("../lib/utilities");
const path = require("path");
const uniqid = require("uniqid");
const { check, validationResult } = require("express-validator");
const reviewRoutes = require("../reviews");

const router = express.Router();

// router.use("/:id/reviews", reviewRoutes);
const upload = multer({});

const projectsImagePath = path.join(__dirname, "../../public/img/projects");
const projectFilePath = path.join(__dirname, "projects.json"); //GETTING FILEPATH TO JSON
const reviewsFilePath = path.join(__dirname, "../reviews/reviews.json");

router.get("/", async (req, res, next) => {
  try {
    const projectDataBase = await readDB(projectFilePath); //RUNS FUNCTION TO GET DATABASE
    if (projectDataBase.length > 0) {
      res.status(201).send(projectDataBase); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    } else {
      const err = {};
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (err) {
    err.httpStatusCode = 404;
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const projectDataBase = await readDB(projectFilePath); //RUNS FUNCTION TO GET DATABASE
    const singleProject = projectDataBase.filter(
      (project) => project.ID === req.params.id
    );
    if (singleProject.length > 0) {
      res.status(201).send(singleProject); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    } else {
      const err = {};
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (err) {
    err.httpStatusCode = 404;
    next(err);
  }
});

router.post(
  "/",
  [
    check("Name")
      .exists()
      .isLength({ min: 1 })
      .withMessage("Give it a name, you bitch"),
    check("Description")
      .exists()
      .isLength({ min: 1 })
      .withMessage("Gimmie a description man"),
    check("RepoURL")
      .exists()
      .isLength({ min: 1 })
      .withMessage("You have to give a URL for the project repository"),
    check("LiveURL")
      .exists()
      .isLength({ min: 1 })
      .withMessage("You need to have a live demo of your project"),
    check("StudentID")
      .exists()
      .isLength({ min: 1 })
      .withMessage("You need to have your Student ID"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = {};
      err.message = errors;
      err.httpStatusCode = 400;
      next(err);
    } else {
      const projectDataBase = await readDB(projectFilePath); //RUNS FUNCTION TO GET DATABASE
      const newProject = req.body; //GETS THE REQUEST BODY
      newProject.ID = uniqid(); //GIVES BODY NEW ID
      newProject.CreationDate = new Date(); //GIVES BODY CREATION DATE
      projectDataBase.push(newProject); //ADDS BODY TO DATABSE
      await writeDB(projectFilePath, projectDataBase); //OVERWRITES OLD DATABASE WITH NEW DATABASE
      res.status(201).send(projectDataBase); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    }
  }
);

router.put("/:id", async (req, res, next) => {
  try {
    const projectDataBase = await readDB(projectFilePath); //RUNS FUNCTION TO GET DATABASE
    const singleProject = projectDataBase.filter(
      (project) => project.ID === req.params.id
    );
    if (singleProject.length > 0) {
      const filteredDB = projectDataBase.filter(
        (project) => project.ID !== req.params.id
      );
      console.log(singleProject);
      const editedProject = {
        ...req.body,
        ID: singleProject[0].ID,
        StudentID: singleProject[0].StudentID,
        CreationDate: singleProject[0].CreationDate,
        ModifiedDate: new Date(),
      };
      filteredDB.push(editedProject);
      await writeDB(projectFilePath, filteredDB);
      res.status(201).send(filteredDB); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    } else {
      const err = {};
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (err) {
    err.httpStatusCode = 404;
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const projectDataBase = await readDB(projectFilePath); //RUNS FUNCTION TO GET DATABASE
    const singleProject = projectDataBase.filter(
      (project) => project.ID === req.params.id
    );
    if (singleProject.length > 0) {
      const filteredDB = projectDataBase.filter(
        (project) => project.ID !== req.params.id
      );
      await writeDB(projectFilePath, filteredDB);
      res.status(201).send(filteredDB); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    } else {
      const err = {};
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (err) {
    err.httpStatusCode = 404;
    next(err);
  }
});

router.post(
  "/:id/uploadPhoto",
  upload.single("projectImg"),
  async (req, res, next) => {
    let nameArray = req.file.originalname.split(".");
    let fileType = "." + nameArray.pop();
    console.log(nameArray);
    console.log(fileType);
    try {
      await writeFile(
        path.join(projectsImagePath, req.params.id + fileType),
        req.file.buffer
      );
      res.send("ok");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.get("/:name/download", (req, res, next) => {
  const source = createReadStream(
    path.join(projectsImagePath, `${req.params.name}`)
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${req.params.name}`
  );
  pipeline(source, res, (error) => next(error));
});

router.get("/:id/reviews", async (req, res, next) => {
  try {
    const reviewDataBase = await readDB(reviewsFilePath); //RUNS FUNCTION TO GET DATABASE
    if (reviewDataBase.length > 0) {
      const singleProject = reviewDataBase.filter(
        (review) => review.ProjectID === req.params.id
      );
      res.status(201).send(singleProject); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    } else {
      const err = {};
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (err) {
    err.httpStatusCode = 404;
    next(err);
  }
});

router.post(
  "/:id/reviews",
  [
    check("ProjectID")
      .exists()
      .withMessage("Givew the id of the project you're reviewing"),
    check("name").exists().isLength({ min: 1 }).withMessage("Gimmie your name"),
    check("text")
      .exists()
      .isLength({ min: 1 })
      .withMessage("You have to give a review to the project"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = {};
      err.message = errors;
      err.httpStatusCode = 400;
      next(err);
    } else {
      const reviewDataBase = await readDB(reviewsFilePath); //RUNS FUNCTION TO GET DATABASE
      const newReview = req.body; //GETS THE REQUEST BODY
      newReview.ID = uniqid(); //GIVES BODY NEW ID
      newReview.date = new Date(); //GIVES BODY CREATION DATE
      reviewDataBase.push(newReview); //ADDS BODY TO DATABSE
      await writeDB(reviewsFilePath, reviewDataBase); //OVERWRITES OLD DATABASE WITH NEW DATABASE
      res.status(201).send(reviewDataBase); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    }
  }
);

module.exports = router;
