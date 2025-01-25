const express = require("express");
const router = new express.Router();
const errorController = require("../controllers/intentionalErrorController");
const utilities = require("../utilities/")

router.get("/", utilities.handleErrors(errorController.buildIntentionalError));

module.exports = router;
