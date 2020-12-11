/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const ExpressError = require("../expressError");

  /**************************************************
   * 
   * /** User of the site. 
   * 
   **************************************************/

class User {
  constructor({ username, password, firstName, lastName, phone }) {
    this.username = username;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
  }

  /**************************************************
   * 
   * register new user -- returns
   *    {username, password, first_name, last_name, phone}
   * 
   **************************************************/

  static async register({ username, password, firstName, lastName, phone }) {
    // hash the password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    // save the new user to the database
    const results = await db.query(`
      INSERT INTO users (
        username, 
        password, 
        first_name, 
        last_name, 
        phone, 
        join_at,
        last_login_at)
      VALUES ($1, $2, $3, $4, $5, LOCALTIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, firstName, lastName, phone]
    );

    // return the object with user data on it
    return results.rows[0];
  }

  /**************************************************
   * 
   * Authenticate: is this username/password valid? 
   * 
   * Returns boolean. 
   * 
   **************************************************/

  static async authenticate(username, password) { 
    // try to find the user
    const results = await db.query(`
      SELECT password 
      FROM users 
      WHERE username = $1`, 
      [username]
    );
    const user = results.rows[0];
    console.log("user: ", user);

    // compare hashed pw to hash of login pw
    const pwMatch = await bcrypt.compare(password, user.password);

    // return a boolean: true only if (1) user was found AND (2) password is correct
    return user && pwMatch;
  }

  /**************************************************
   * 
   * Update last_login_at for user
   * 
   **************************************************/

  static async updateLoginTimestamp(username) { 
    // get user by username (use the method)

    // set the last_login_at property of the user to CURRENT_TIMESTAMP in the database
    const result = await db.query(`
      UPDATE users
      SET last_login_at = CURRENT_TIMESTAMP
      WHERE username = $1
      RETURNING username`,
      [username]
    );

    if (!result.rows[0]) {
      throw new ExpressError(`No such user: ${username}`, 404);
    }
  }

  /**************************************************
   * 
   * All: basic info on all users:
   * 
   * [{username, first_name, last_name, phone}, ...]
   * 
   **************************************************/

  static async all() { }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { }



  
  /**************************************************
   * 
   * Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   * 
   **************************************************/

  static async messagesFrom(username) { }

  /**************************************************
   * 
   * Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   * 
   **************************************************/

  static async messagesTo(username) { }
}


module.exports = User;