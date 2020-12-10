const express = require("express");

const { readDB, writeDB } = require("../lib/utilities");
const path = require("path");
const uniqid = require("uniqid");
const { check, validationResult } = require("express-validator");
const router = express.Router();

const reviewsFilePath = path.join(__dirname, "reviews.json"); //GETTING FILEPATH TO JSON

router.get("/", async (req, res, next) => {
  try {
    const reviewDataBase = await readDB(reviewsFilePath); //RUNS FUNCTION TO GET DATABASE
    if (reviewDataBase.length > 0) {
      res.status(201).send(reviewDataBase); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
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
