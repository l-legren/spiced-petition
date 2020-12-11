const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

// EDIT ABOVEEE!!!!!!!!!!!!!!! create db first!!!

//spicedPg("whoAreWeTalkingTo:whichUserWillRunTheCommands:paswordForThatDbUser@PostgrePort/nameOfDataBase")

// INSERTING INTO DATABASE

module.exports.addSigner = (signature, userId) => {
    const q = `INSERT INTO signatures (signature, user_id) 
    VALUES ($1, $2)
    RETURNING signature`;
    const params = [signature, userId];

    return db.query(q, params);
};

module.exports.addSignUp = (first, last, email, password) => {
    const q = `INSERT INTO users (first, last, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id`;
    const params = [first, last, email, password];

    return db.query(q, params);
};

module.exports.addProfile = (age, city, url, userId) => {
    const q = `INSERT INTO user_profiles (age, city, url, user_id)
    VALUES ($1, LOWER ($2), $3, $4)`;
    const params = [age, city, url, userId];

    return db.query(q, params);
};

// COUNTING

module.exports.dbCounter = () => {
    const counter = `SELECT COUNT(*) FROM signatures`;
    const results = db.query(counter);
    return results;
};

// FETCHING DATA FROM DATABASE

module.exports.getPassword = (email) => {
    const q = `SELECT password, id FROM users
    WHERE email=($1)`;
    const params = [email];

    return db.query(q, params);
};

module.exports.getSigners = () => {
    const q = `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url 
    FROM users 
    LEFT JOIN user_profiles 
    ON users.id = user_profiles.user_id;`;

    return db.query(q);
};

module.exports.getSignerById = (userId) => {
    const q = `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url 
    FROM users 
    LEFT JOIN user_profiles 
    ON users.id = user_profiles.user_id
    WHERE users.id = ($1)`;
    const params = [userId];

    return db.query(q, params);
};

module.exports.getSignersByCity = (city) => {
    const q = `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url 
    FROM users 
    LEFT JOIN user_profiles 
    ON users.id = user_profiles.user_id
    WHERE user_profiles.city = ($1)`;
    const params = [city];

    return db.query(q, params);
};

module.exports.didSigned = (userId) => {
    const q = `SELECT signature FROM signatures WHERE user_id=($1)`;
    const params = [userId];

    return db.query(q, params);
};

/* UPDATING QUERYS */

module.exports.editProfileUsersPw = (first, last, email, password, userId) => {
    const q = `UPDATE users 
    SET first = $1,
        last = $2,
        email = $3,
        password = $4
        WHERE id = $5`;
    const params = [first, last, email, password, userId];

    return db.query(q, params);
};

module.exports.editProfileUsersNoPw = (first, last, email, userId) => {
    const q = `UPDATE users 
    SET first = $1,
        last = $2,
        email = $3
        WHERE id = $4`;
    const params = [first, last, email, userId];

    return db.query(q, params);
};

/* UPSERTING QUERYS */

module.exports.upsertingPw = (city, age, url, userId) => {
    const q = `INSERT INTO user_profiles (city, age, url, user_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET city = $1, age = $2, url = $3, user_id = $4`;
    const params = [city, age, url, userId];

    return db.query(q, params);
};

/* DELETING QUERYS */

module.exports.deleteSig = (userId) => {
    const q = `DELETE FROM signatures
    WHERE user_id = ($1)`;
    const params = [userId];

    return db.query(q, params);
};
