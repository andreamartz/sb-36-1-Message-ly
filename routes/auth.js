const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const User = require("../models/user");
const jwt = require("jsonwebtoken");


// const bcrypt = require("bcrypt");

const { SECRET_KEY, DB_URI, BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ExpressError("Username and password required", 400);
    }

    const isAuthenticated = await User.authenticate(username, password);

    if (isAuthenticated) {
      const token = jwt.sign({ username }, SECRET_KEY);
      return res.json({ message: "Logged in!", token });
    } else {
      throw new ExpressError("Invalid username or password", 400);
    }
  } catch (err) {
    return next(err);
  }
});



/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, res, next) => {
  try {
    const { username, password, firstName, lastName, phone } = req.body;
    if (!username || !password) {
      throw new ExpressError("Username, password, first name, last name, and phone number are required.", 400);
    }
    // register user
    const result = await User.register({ username, password, firstName, lastName, phone });

    // log user in

    // return token

    return res.json(result);
  } catch (err) {
    console.log(err);
    if(err.code === '23505') {
      return next(new ExpressError("Username taken; please choose another.", 400));
    }
    return next(err);
  }
});

 module.exports = router;