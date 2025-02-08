// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const invValidate = require('../utilities/inventory-validation');

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

//details route
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildDetailsView));

//managment routes
router.get("/", utilities.checkLogin, utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildManagementView));
router.get("/add-classification", utilities.checkLogin, utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddClassificationView));
router.get("/add-inventory", utilities.checkLogin, utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddInventoryView));

//post request for classification creation
router.post(
    "/management/add-classification", 
    utilities.checkLogin, utilities.checkEmployeeOrAdmin,
    invValidate.AddClassificationRules(),
    invValidate.checkAddClassificationData,
    utilities.handleErrors(invController.addClassification));
//post request for inventory creation
router.post(
    "/management/add-inventory", 
    utilities.checkLogin, utilities.checkEmployeeOrAdmin,
    invValidate.AddInventoryRules(),
    invValidate.checkAddInventoryData,
    utilities.handleErrors(invController.addInventory));

//returns json with all inventory items in classifiaction
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

//edit an inventory item
router.get("/edit/:inventory_id",utilities.checkLogin, utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildEditInventoryView));
router.post(
    "/update/", 
    utilities.checkLogin, utilities.checkEmployeeOrAdmin,
    invValidate.inventoryUpdateRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory));
//delete an inventory item
router.get("/delete/:inventory_id",utilities.checkLogin, utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildDeleteInventoryView));
router.post("/delete/",utilities.checkLogin, utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.deleteInventory))


module.exports = router;