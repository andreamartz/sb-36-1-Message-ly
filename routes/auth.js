const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const User = require("../models/user");


const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/


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
      // const results = await User.register({ username, password, firstName, lastName, phone});
      // hash the password
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      // save to database
      const results = await db.query(`
        INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5, LOCALTIMESTAMP,CURRENT_TIMESTAMP)
        RETURNING username`,
        [username, hashedPassword, firstName, lastName, phone]
      );
      console.log("results.rows: ", results.rows);
      console.log("results.rows[0]: ", results.rows[0]);
      return res.json(results.rows[0]);
      // const results = await User.register({ username, password, firstName, lastName, phone });
      // return res.json(results.rows[0]);
    } catch (err) {
      console.log(err);
      if(err.code === '23505') {
        return next(new ExpressError("Username taken; please choose another.", 400));
      }
      return next(err);
    }
  });

 module.exports = router;