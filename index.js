const express = require("express");
const app = express();
const hb = require("express-handlebars");
const csurf = require("csurf");
const { getSigner, addSigner, dbCounter, addSignUp, getPassword } = require("./db.js");
const secrets = require("./secrets");
const cookieSession = require("cookie-session");
const { hash, compare } = require("./bc.js");

// this configures express to use express-handlebars as the template engine
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

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

// Serve all static files
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
    // console.log("req.body: ", req.body);
    const { first, last, signature } = req.body;
    addSigner(first, last, signature).then(({ rows }) =>{
        req.session.id = rows[0].signature_user;
        res.redirect("/thanks");
    }).catch((err) => console.error("error in addSinger: ", err));
});

app.get("/thanks", (req, res) => {
    // console.log("Thanks for signing!");
    const sign = req.session.id;
    dbCounter()
        .then(({ rows }) => {
            res.render("thanks", {
                main: "layout",
                counter: rows[0].count,
                sign,             
            });
        }).catch((err) => {
            console.log(err);
        });     
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



app.get("/register", (req, res) => {
    let errorSigning = req.session.error;
    res.render("register", {
        layout: "main",
        errorSigning
    });
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   

app.post("/register", (req, res) => {
    // console.log(req.body);
    const { first, last, email, password } = req.body;
    hash(password).then((hash)=> {
        // console.log(hash);
        return addSignUp(first, last, email, hash)
            .then(({ rows }) => {
                req.session.userId = rows[0].id;
                if (req.session.error) {
                    req.session.error = null;
                }
                res.redirect("/petition");
            })
            .catch(({ detail }) => {
                console.log(detail);
                req.session.error = detail;
                res.redirect("/register");
            });
    }).catch(err => console.log(err));
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main"
    });
});

app.post("/login", (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    getPassword(email).then(({ rows }) => {
        const hash = rows[0].password;
        compare(password, hash).then((booleanResult) => {
            if (booleanResult) {
                req.session.userId = rows[0].id;
                console.log(req.session);
            }
        });
    });
});

app.get("*", (req, res) => {
    res.redirect("/");
});

app.listen(8080, () => console.log("Server listening on 8080..."));