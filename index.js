const express = require("express");
const app = express();
const hb = require("express-handlebars");
const { getSigner, addSigner } = require("./db.js");
const data = require("./data");

// this configures express to use express-handlebars as the template engine
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// Serve all static files
app.use(express.static("./public"));
app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use((req, res, next) => {
    console.log("-----------------");
    console.log(`${req.method} request coming in on route ${req.url}`);
    console.log("-----------------");
    next();
});

app.get("/petition", (req, res) =>  {
    res.render("petition", {
        layout: "main"
    }
    );
});

app.post("/petition", (req, res) => {
    console.log("POST request was made!");
    console.log("req.body: ", req.body);
    const { first, last } = req.body;
    addSigner(first, last).then(() =>{
        console.log("It worked!");
        res.sendStatus(200);
    }).catch((err) => console.error("error in addSinger: ", err));
});

app.get("/signers", (req, res) => {
    getSigner()
        .then(({ result }) => {
            console.log("result from getSigner: ", result);
        })
        .catch((err) => console.error(err));
});

// app.post("/add-signer", (req, res) => {
//     addSigner("Max", "Mustermann", "signi").then(() => {
//         console.log("It worked");
//         res.sendStatus(200);
//     })
//         .catch((err) => console.log("error in addSigner: ", err));
// });

app.listen(8080, () => console.log("Server listening on 8080..."));
