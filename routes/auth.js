const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const User = require("../models/user");


const bcrypt = require("bcrypt");
const { DB_URI, BCRYPT_WORK_FACTOR } = require("../config");
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
    // try to find the user
    // const result = User.authenticate(username, password);
    const results = await db.query(`
      SELECT username, password 
      FROM users 
      WHERE username = $1`, 
      [username]
    );
    const user = results.rows[0];
    console.log("user: ", user);

    // if user found, compare hashed pw to hash of login pw
    if (user) {
      const pwMatch = await bcrypt.compare(password, user.password);
      if (pwMatch) {
        return res.json({ message: "Logged in!" });
      }
    }
    // throw error if user not found or password not verified
    throw new ExpressError("Invalid username or password", 400);
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