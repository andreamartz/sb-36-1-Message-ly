/** User class for message.ly */
const bcrypt = require("bcrypt");
const { DB_URI, BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db");

/** User of the site. */

class User {
  constructor({ username, password, firstName, lastName, phone }) {
    this.username = username;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
  }
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, firstName, lastName, phone }) {
    // hash the password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    console.log(hashedPassword);

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
    console.log("results.rows: ", results.rows);
    console.log("results.rows[0]: ", results.rows[0]);
    return results.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

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

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}


module.exports = User;