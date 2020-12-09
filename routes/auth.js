const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const User = require("../models/user");


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