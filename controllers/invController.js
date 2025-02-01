const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null
  });
}

invCont.buildDetailsView = async function (req, res, next) {
  const invId = req.params.inventoryId;
  const data = await invModel.getDetailsByInvId(invId);
  const card = await utilities.buildDetailsCard(data[0]);
  const nav = await utilities.getNav();

  const year = data[0].inv_year;
  const model = data[0].inv_model;
  const make = data[0].inv_make;
  res.render("./inventory/details", {
    title: year + ' ' + make + (model !== "Custom" ? ' ' + model : ''),
    nav,
    card,
    errors: null
  });
}

invCont.buildManagementView = async function (req, res, next) {
  const nav = await utilities.getNav();
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null
  });
}

invCont.buildAddClassificationView = async function (req, res, next) {
  const nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null
  });
}
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;

  const result = await invModel.addClassification(
    classification_name
  );

  if (result) {
    req.flash(
      "notice",
      `Classification: ${classification_name} Created`
    );
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null
    });
  } else {
    req.flash("notice", "Failed to add classification")
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null
    });
  }
}

invCont.buildAddInventoryView = async function (req, res, next) {
  const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    errors: null
  });
}
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav();

  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;

  const result = await invModel.addInventory(
    inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
  );

  if (result) {
    req.flash(
      "notice",
      `Vehicle Added`
    );
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null
    });
  } else {
    req.flash("notice", "Failed to add vehicle")
    res.status(501).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList: await utilities.buildClassificationList(classification_id),
      errors: null
    });
  }
}



module.exports = invCont;