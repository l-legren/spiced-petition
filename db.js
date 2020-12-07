const spicedPg = require("spiced-pg");
const db = spicedPg
("postgres:postgres:postgres@localhost:5432/petition");

// EDIT ABOVEEE!!!!!!!!!!!!!!! create db first!!!

//spicedPg("whoAreWeTalkingTo:whichUserWillRunTheCommands:paswordForThatDbUser@PostgrePort/nameOfDataBase")

module.exports.getSigner = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.addSigner = (first, last, signature) => {
    const q = 
    `INSERT INTO signatures (first_name, last_name, signature_user) 
    VALUES ($1, $2, $3)
    RETURNING signature_user`;
    const params = [first, last, signature];
    
    return db.query(q, params);
};

module.exports.addSignUp = (first, last, email, password) => {
    const q =
    `INSERT INTO users (first, last, email, password)
    VALUES ($1, $2, $3, $4)`;
    const params = [first, last, email, password];

    return db.query(q, params);
};

module.exports.dbCounter = () => {
    const counter = `SELECT COUNT(*) FROM signatures`;
    const results = db.query(counter);
    return results;
};