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

  static async all() { 
    // db query to get all users
    const results = await db.query(`
      SELECT username, 
             first_name, 
             last_name, 
             phone
      FROM users
      ORDER BY username
    `)

    // return all rows of the result as objects in an array
    return results.rows;
  }

  /**************************************************
   * 
   * Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } 
   * 
   ***************************************************/

  static async get(username) { 
    // query the db to find that record
    console.log("username: ", username);
    const results = await db.query(`
      SELECT username, 
             first_name, 
             last_name, 
             phone, 
             join_at, 
             last_login_at
      FROM users
      WHERE username = $1`,
      [username]
    );
    // if no user found, throw error
    if (results.rows.length === 0) {
      throw new ExpressError(`User with username ${ username } not found`, 404);
    }
    console.log("results.rows[0]: ", results.rows[0]);

    // return an object with that user's data
    return results.rows[0];
  }

  
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

  static async messagesFrom(username) {
    console.log("messagesFrom method username: ", username);
    const results = await db.query(`
      SELECT m.id,
             m.body,
             m.sent_at,
             m.read_at, 
             m.to_username,
             u.username,
             u.first_name,
             u.last_name,
             u.phone
      FROM messages AS m
      LEFT JOIN users AS u ON m.from_username = u.username
      WHERE m.from_username = $1`,
      [username]
    );
    console.log("messagesFrom method msgs: ", results.rows);
    // return array of message objects (NOT message instances)
    const msgs = results.rows.map(msg => (
      {id: msg.id,
       to_user: { username: msg.to_username,
                  first_name: msg.first_name,
                  last_name: msg.last_name,
                  phone: msg.phone 
       }, 
       body: msg.body, 
       sent_at: msg.sent_at, 
       read_at: msg.read_at
      }
    ));
    return msgs;
  }


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

  static async messagesTo(username) {
    console.log("messagesTo method username: ", username);
    const results = await db.query(`
      SELECT m.id,
            m.body,
            m.sent_at,
            m.read_at, 
            m.from_username,
            u.username,
            u.first_name,
            u.last_name,
            u.phone
      FROM messages AS m
      LEFT JOIN users AS u ON m.to_username = u.username
      WHERE m.to_username = $1`,
      [username]
    );
    console.log("messagesTo method msgs: ", results.rows);
    // return array of message objects (NOT message instances)
    const msgs = results.rows.map(msg => (
      {id: msg.id,
      from_user: { username: msg.from_username,
                  first_name: msg.first_name,
                  last_name: msg.last_name,
                  phone: msg.phone 
      }, 
      body: msg.body, 
      sent_at: msg.sent_at, 
      read_at: msg.read_at
      }
    ));
    return msgs;
  }
}





module.exports = User;