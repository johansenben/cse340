// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

//details route
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildDetailsView));

module.exports = router;