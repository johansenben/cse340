// Needed Resources 
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const accountValidate = require('../utilities/account-validation');

//account route (after login)
router.get('/', utilities.checkLogin, accountController.buildLoggedInScreen);
// Route to login
router.get("/login", utilities.handleErrors(accountController.buildLogin));
// Route to log out
router.get("/logout", utilities.checkLogin, utilities.handleErrors(accountController.logout));
//route to registration
router.get("/registration", utilities.handleErrors(accountController.buildRegistration));
//route to account management
router.get("/update", utilities.checkLogin, utilities.handleErrors(accountController.buildManageView));
//post request to update account data
router.post(
    "/update", 
    utilities.checkLogin, 
    accountValidate.updateRules(),
    accountValidate.checkUpdateData,
    utilities.handleErrors(accountController.updateAccount));
//post request to change passwor
router.post(
    "/change-password", 
    utilities.checkLogin, 
    accountValidate.passwordRules(),
    accountValidate.checkPasswordData,
    utilities.handleErrors(accountController.changePassword));

//post request for account creation
router.post(
    "/register", 
    accountValidate.registationRules(),
    accountValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount));

// Process the login attempt
router.post(
    "/login",
    // regValidate.loginRules(),
    // regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
);

module.exports = router;

/**
account_firstname: Basic
account_lastname: Client
account_email: basic@340.edu
account_password: I@mABas1cCl!3nt

account_firstname: Happy
account_lastname: Employee
account_email: happy@340.edu
account_password: I@mAnEmpl0y33

account_firstname: Manager
account_lastname: User
account_email: manager@340.edu
account_password: I@mAnAdm!n1strat0r
 */