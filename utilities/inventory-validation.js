const utilities = require(".");
const { body, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model")

const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.AddClassificationRules = () => {
    return [
      // classification name
      body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .matches(/^[a-zA-Z0-9]*$/)
        .withMessage("Classification name can't include spaces or special characters.")
        .custom(async (classification_name) => {
            const classificationExists = await invModel.checkExistingClassification(classification_name);
            if (classificationExists){
                throw new Error("Classification already exists")
            }
        })
        .withMessage("Please provide an unused classification name with no spaces or special character."), // on error this message is sent.
    ];
  }


  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkAddClassificationData = async (req, res, next) => {
    const { classification_name } = req.body;
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      res.render("inventory/add-classification", {
        errors,
        title: "Add Classification",
        nav,
        classification_name
      });
      return;
    }
    next();
  }

validate.AddInventoryRules = () => {
    return [
      body("inv_make")
        .trim().escape().notEmpty().isLength({ min: 1 })
        .withMessage("invalid inventory make"),
      body("inv_model")
        .trim().escape().notEmpty().isLength({ min: 1 })
        .withMessage("invalid inventory model"),
      body("inv_year")
        .trim().escape().notEmpty()
        .isNumeric().withMessage("year must be a number")
        .isLength({ min: 4, max: 4 }).withMessage("year must have 4 digits"),
      body("inv_description")
        .trim().escape().notEmpty().isLength({ min: 1 })
        .withMessage("invalid inventory description"),
      body("inv_image").trim().escape().notEmpty().isLength({ min: 1 })
        .withMessage("invalid inventory image"),
      body("inv_thumbnail")
        .trim().escape().notEmpty().isLength({ min: 1 })
        .withMessage("invalid inventory thumbnail"),
      body("inv_price")
        .trim().escape().notEmpty().isLength({ min: 1 }).isNumeric()
        .withMessage("invalid inventory price"),
      body("inv_miles")
        .trim().escape().notEmpty().isLength({ min: 1 }).isNumeric()
        .withMessage("invalid inventory miles"),
      body("inv_color")
        .trim().escape().notEmpty().isLength({ min: 1 })
        .withMessage("invalid inventory color"),
      body("classification_id")
        .trim().escape().notEmpty().isLength({ min: 1 })
        .custom(async (classification_id) => {
          const used = await invModel.isClassificationIdUsed(classification_id);
          if (!used){
              throw new Error("Classification already exists")
          }
        })
        .withMessage("invalid classification_id"),
    ];
  }


  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkAddInventoryData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      res.render("inventory/add-inventory", {
        errors,
        title: "Add Vehicle",
        nav,
        classificationList: await utilities.buildClassificationList(classification_id),
        inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id
      });
      return;
    }
    next();
}

validate.inventoryUpdateRules = () => {
  return [
    body("inv_make")
      .trim().escape().notEmpty().isLength({ min: 1 })
      .withMessage("invalid inventory make"),
    body("inv_model")
      .trim().escape().notEmpty().isLength({ min: 1 })
      .withMessage("invalid inventory model"),
    body("inv_year")
      .trim().escape().notEmpty()
      .isNumeric().withMessage("year must be a number")
      .isLength({ min: 4, max: 4 }).withMessage("year must have 4 digits"),
    body("inv_description")
      .trim().escape().notEmpty().isLength({ min: 1 })
      .withMessage("invalid inventory description"),
    body("inv_image").trim().escape().notEmpty().isLength({ min: 1 })
      .withMessage("invalid inventory image"),
    body("inv_thumbnail")
      .trim().escape().notEmpty().isLength({ min: 1 })
      .withMessage("invalid inventory thumbnail"),
    body("inv_price")
      .trim().escape().notEmpty().isLength({ min: 1 }).isNumeric()
      .withMessage("invalid inventory price"),
    body("inv_miles")
      .trim().escape().notEmpty().isLength({ min: 1 }).isNumeric()
      .withMessage("invalid inventory miles"),
    body("inv_color")
      .trim().escape().notEmpty().isLength({ min: 1 })
      .withMessage("invalid inventory color"),
    body("classification_id")
      .trim().escape().notEmpty().isLength({ min: 1 })
      .custom(async (classification_id) => {
        const used = await invModel.isClassificationIdUsed(classification_id);
        if (!used){
            throw new Error("Classification already exists")
        }
      })
      .withMessage("invalid classification_id"),
  ];
}
/* ******************************
* Check data and return errors or continue to registration
* ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_id } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const itemName = `${inv_make} ${inv_model}`
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit " + itemName,
      nav,
      classificationList: await utilities.buildClassificationList(classification_id),
      inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id, inv_id, inv_image, inv_thumbnail
    });
    return;
  }
  next();
}
  
validate.editClassificationRules = () => {
  return [
    // classification name
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .matches(/^[a-zA-Z0-9]*$/)
      .withMessage("Classification name can't include spaces or special characters.")
      .custom(async (classification_name) => {
          const classificationExists = await invModel.checkExistingClassification(classification_name);
          if (classificationExists){
              throw new Error("Classification already exists")
          }
      })
      .withMessage("Please provide an new and unused classification name with no spaces or special character."), // on error this message is sent.
  ];
}

validate.checkEditClassificationData = async (req, res, next) => {
  const { classification_name, classification_id } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/edit-classification", {
      errors,
      title: "Edit " + classification_name,
      nav,
      classification_name, classification_id
    });
    return;
  }
  next();
}


module.exports = validate;