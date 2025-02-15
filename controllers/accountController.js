const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null
    });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegistration(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
    });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    // Hash the password before storing
    let hashedPassword;
    try {
      // regular password and cost (salt is generated automatically)
      hashedPassword = await bcrypt.hashSync(account_password, 10);
    } catch (error) {
      req.flash("notice", 'Sorry, there was an error processing the registration.');
      res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null
      });
    }
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      );
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null
      });
    }
  }

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      return res.redirect("/account/");
    }
    else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email
      });
    }
  } catch (error) {
    throw new Error('Access Forbidden');
  }
}

const buildLoggedInScreen = async (req, res, next) => {
  let nav = await utilities.getNav();
    res.render("account/account", {
        title: "Account",
        nav,
        errors: null
    });
}

const buildManageView = async (req, res, next) => {
  let nav = await utilities.getNav();
  res.render("account/update", {
    title: "Manage Account",
    nav,
    errors: null,
    account_firstname: res.locals.accountData.account_firstname,
    account_lastname: res.locals.accountData.account_lastname,
    account_email: res.locals.accountData.account_email,
    account_id: res.locals.accountData.account_id
  });
}

const logout = async (req, res) => {
  if (req.cookies.jwt)
    res.clearCookie("jwt");
  res.status(200).redirect('/'); //go to home
}

const updateAccount = async (req, res) => {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } = req.body;
  const accountData = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id);
  if (accountData) {
    try {
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      req.flash("notice", "Account Data Updated");
      res.status(201).render("account/update", {
        title: "Manage Account",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
        account_id
      });
      return;
    } catch (error) {
      req.flash("notice", "Error in updating account")
    }
  } else {
    req.flash("notice", "Account Data Missing")
  }
  res.render("account/update", {
    title: "Manage Account",
    nav,
    errors: null,
    account_firstname,
    account_lastname,
    account_email,
    account_id
  });
}

const changePassword = async (req, res) => {
  let nav = await utilities.getNav();
  const { account_password, confirm_password, account_id } = req.body;
  if (account_password != confirm_password) {
    req.flash("notice", "Passwords must match.");
    res.status(400).render("account/update", {
      title: "Manage Account",
      nav,
      errors: null,
      account_firstname: res.locals.accountData.account_firstname,
      account_lastname: res.locals.accountData.account_lastname,
      account_email: res.locals.accountData.account_email,
      account_id: res.locals.accountData.account_id
    });
    return;
  }
  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", 'password change failed');
    res.status(500).render("account/update", {
      title: "Manage Account",
      nav,
      errors: null,
      account_firstname: res.locals.accountData.account_firstname,
      account_lastname: res.locals.accountData.account_lastname,
      account_email: res.locals.accountData.account_email,
      account_id: res.locals.accountData.account_id
    });
    return;
  }

  const result = accountModel.changePassword(hashedPassword, account_id);
  if (result) {
    req.flash("notice", "Password Changed");
    res.status(201).render("account/update", {
      title: "Manage Account",
      nav,
      errors: null,
      account_firstname: res.locals.accountData.account_firstname,
      account_lastname: res.locals.accountData.account_lastname,
      account_email: res.locals.accountData.account_email,
      account_id: res.locals.accountData.account_id
    });
  } else {
    req.flash("notice", "Failed to change password");
    res.status(501).render("account/update", {
      title: "Manage Account",
      nav,
      errors: null,
      account_firstname: res.locals.accountData.account_firstname,
      account_lastname: res.locals.accountData.account_lastname,
      account_email: res.locals.accountData.account_email,
      account_id: res.locals.accountData.account_id
    });
  }
}

const buildDeleteAccount = async (req, res) => {
  let nav = await utilities.getNav();
  res.render("account/delete-account", {
    title: "Confirm: Delete Account",
    nav,
    errors: null,
    account_id: res.locals.accountData.account_id
  });
}
const deleteAccount = async (req, res) => {
  const { account_id } = req.body;
  const result = await accountModel.deleteAccount(account_id);
  if (result) {
    req.flash("notice", "Account Deleted");
    logout(req, res);
  } else {
    req.flash("notice", "Failed to delete account!");
    res.status(501).render("account/delete-account", {
      title: "Confirm: Delete Account",
      nav,
      errors: null,
      account_id: res.locals.accountData.account_id
    });
  }
}
  
module.exports = { buildLogin, buildRegistration, registerAccount, accountLogin, buildLoggedInScreen, buildManageView, updateAccount, changePassword, logout, buildDeleteAccount, deleteAccount }