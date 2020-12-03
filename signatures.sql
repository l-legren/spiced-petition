DROP TABLE IF EXISTS signatures;

 CREATE TABLE signatures (
     id SERIAL PRIMARY KEY,
     first_name VARCHAR NOT NULL CHECK (first_name != ''),
     last_name VARCHAR NOT NULL CHECK (last_name != ''),
     signature_user VARCHAR CHECK (signature_user != '')
 );

 INSERT INTO signatures (first_name, last_name, signature_user) VALUES ('Max', 'Mustermann', 'blabla');
--  INSERT INTO signatures (firstName, lastName, signatureUser) VALUES ('Berlin', 'loquesea', 'cutro');