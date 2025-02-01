// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const regValidate = require('../utilities/inventory-validation');

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

//details route
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildDetailsView));

//managment routes
router.get("/management", utilities.handleErrors(invController.buildManagementView));
router.get("/management/add-classification", utilities.handleErrors(invController.buildAddClassificationView));
router.get("/management/add-inventory", utilities.handleErrors(invController.buildAddInventoryView));

//post request for classification creation
router.post(
    "/management/add-classification", 
    regValidate.AddClassificationRegistationRules(),
    regValidate.checkAddClassificationRegData,
    utilities.handleErrors(invController.addClassification));
//post request for inventory creation
router.post(
    "/management/add-inventory", 
    regValidate.AddInventoryRegistationRules(),
    regValidate.checkAddInventoryRegData,
    utilities.handleErrors(invController.addInventory));


module.exports = router;