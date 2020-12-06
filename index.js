const express = require("express");
const app = express();
const hb = require("express-handlebars");
const csurf = require("csurf");
const { getSigner, addSigner, dbCounter } = require("./db.js");
const secrets = require("./secrets");
const cookieSession = require("cookie-session");

// this configures express to use express-handlebars as the template engine
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// Serve all static files
app.use(
    cookieSession({
        secret: secrets.cookieSession,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(
    express.urlencoded({
        extended: false,
    })
);
    
app.use(csurf());

app.use((req, res, next) => {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken;
    next();
});

app.use(express.static("./public"));

app.use((req, res, next) => {
    console.log("-----------------");
    console.log(`${req.method} request coming in on route ${req.url}`);
    console.log("-----------------");
    next();
});

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) =>  {
    res.render("petition", {
        layout: "main"
    }
    );
});

app.post("/petition", (req, res) => {
    // console.log("POST request was made!");
    console.log("req.body: ", req.body);
    const { first, last, signature } = req.body;
    addSigner(first, last, signature).then(() =>{
        // console.log("It worked!");
        req.session.signature = signature;
        console.log(req.session);
        res.redirect("/thanks");
    }).catch((err) => console.error("error in addSinger: ", err));
});

app.get("/thanks", (req, res) => {
    // console.log("Thanks for signing!");
    const sign = req.session.signature;
    dbCounter()
        .then(({ rows }) => {
            res.render("thanks", {
                main: "layout",
                counter: rows[0].count,
                sign,                
            });
        }).catch((err) => console.log(err));     
});

app.get("/petition/signed", (req, res) => {
    // console.log("All this people signed the petition!");
    const signers = [];
    getSigner()
        .then(({rows}) => {
            for (let i = 0; i < rows.length; i++) {
                signers.push(
                    `${i}. ${rows[i].first_name} ${rows[i].last_name} ${rows[i].signature_user}`
                );
                // console.log(signers);
            }
            res.render("signers", {
                layout: "main",
                signers
            });
        })
        .catch((err) => console.error(err));
});

app.listen(8080, () => console.log("Server listening on 8080..."));
