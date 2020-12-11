const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const User = require("../models/user");
const jwt = require("jsonwebtoken");


const { SECRET_KEY } = require("../config");

/******************************************************
 * 
 * POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 ******************************************************/

router.post('/login', async (req, res, next) => {
  try {
    // get the user data sent with the request
    const { username, password } = req.body;

    // if any necessary data are missing, throw an error
    if (!username || !password) {
      throw new ExpressError("Username and password required", 400);
    }

    // authenticate the user using the User.authenticate method
    const isAuthenticated = await User.authenticate(username, password);

    // if the user is authenticated, update the last login time and return a signed token
    if (isAuthenticated) {
      const token = jwt.sign({ username }, SECRET_KEY);
      User.updateLoginTimestamp(username);
      return res.json({ message: "Logged in!", token });
    // if user not authenticated, throw an error
    } else {
      throw new ExpressError("Invalid username or password", 400);
    }
  } catch (err) {
    return next(err);
  }
});


/***********************************************************
 * 
 * POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 * 
 ***********************************************************/

router.post('/register', async (req, res, next) => {
  try {
    // get the user data sent with the request
    const { username, password, firstName, lastName, phone } = req.body;

    // if any necessary data are missing, throw an error
    if (!username || !password || !firstName || !lastName || !phone) {
      throw new ExpressError("Username, password, first name, last name, and phone number are required.", 400);
    }

    // register user using the User.register method
    const result = await User.register({ username, 
      password, 
      firstName, 
      lastName, 
      phone }
    );
    console.log("result: ", result);
    
    // create token for the user
    const token = jwt.sign({ username }, SECRET_KEY);
    console.log("token: ", token);

    // log user in
    const isLoggedIn = User.authenticate(username, password);
    console.log("isLoggedIn: ", isLoggedIn);

    // return token
    return res.json({ token });

  } catch (err) {
    // console.log(err);
    if(err.code === '23505') {
      return res.json( new ExpressError("Username taken; please choose another.", 400) );
    }
    return next(err);
  }
});

 module.exports = router;