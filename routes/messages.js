const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();
const Message = require("../models/message");
const { ensureLoggedIn } = require("../middleware/auth");

/******************************************
 * 
 * GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 ******************************************/

router.get('/:id', 
ensureLoggedIn, 
async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username } = req.user;
    const msg = await Message.get(id);
    console.log("MSG: ", msg);
    // make sure that the requesting user is either the 'to' or 'from' user
    if (username != msg.from_user.username && username != msg.to_user.username) {
      throw new ExpressError("Not authorized to view this message", 403);
    }
    return res.json({ message: msg });
  } catch(err) {
    next(err);
  }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { to_username, body } = req.body;
      const from_username  = req.user.username;
      const msg = await Message.create({ from_username, to_username, body });
      return res.json({ "message": msg });
    } catch (err) {
      next(err);
    }
  });

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read',
ensureLoggedIn,
async (req, res, next) => {
  try {
    console.log("req.user: ", req.user, "req.params: ", req.params);
    const { id } = req.params;
    console.log("req.user: ", req.user);
    const msgGet = await Message.get(id);
    
    if (msgGet.to_user.username !== req.user.username) {
      throw new ExpressError("Not authorized to make this change", 403);
    }
    const msgRead = await Message.markRead(id);
    return res.json({ "message": msgRead });
  } catch (err) {
    next(err);
  }
});

module.exports = router;