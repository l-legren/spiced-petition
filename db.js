const spicedPg = require("spiced-pg");
const db = spicedPg
("postgres:postgres:postgres@localhost:5432/petition");

// EDIT ABOVEEE!!!!!!!!!!!!!!! create db first!!!

//spicedPg("whoAreWeTalkingTo:whichUserWillRunTheCommands:paswordForThatDbUser@PostgrePort/nameOfDataBase")

// INSERTING INTO DATABASE

module.exports.addSigner = (signature, userId) => {
    const q = 
    `INSERT INTO signatures (signature, user_id) 
    VALUES ($1, $2)
    RETURNING signature`;
    const params = [signature, userId];
    
    return db.query(q, params);
};

module.exports.addSignUp = (first, last, email, password) => {
    const q =
    `INSERT INTO users (first, last, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id`;
    const params = [first, last, email, password];

    return db.query(q, params);
};

module.exports.addProfile = (age, city, url, userId) => {
    const q =
    `INSERT INTO user_profiles (age, city, url, user_id)
    VALUES ($1, $2, $3, $4)`;
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
    const q = 
    `SELECT password, id FROM users
    WHERE email=($1)`;
    const params = [email];

    return db.query(q, params);
};

module.exports.getSigner = () => {
    const q = `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url 
    FROM users 
    LEFT JOIN user_profiles 
    ON users.id = user_profiles.user_id;`;

    return db.query(q);
};

module.exports.didSigned = (userId) => {
    const q =
    `SELECT signature FROM signatures WHERE user_id=($1)`;
    const params = [userId];

    return db.query(q, params);
};