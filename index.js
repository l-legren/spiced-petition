const express = require("express");
const app = express();
const hb = require("express-handlebars");
const csurf = require("csurf");
const {
    addSigner,
    addSignUp,
    dbCounter,
    getPassword,
    getSigner,
    didSigned,
    addProfile
} = require("./db.js");
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
    res.redirect("/register");
});

app.get("/petition", (req, res) =>  {
    res.render("petition", {
        layout: "main"
    }
    );
});

app.post("/petition", (req, res) => {
    // console.log("req.body: ", req.body);
    const { signature } = req.body;
    addSigner(signature, req.session.userId).then(({ rows }) =>{
        req.session.signature = rows[0].signature;
        res.redirect("/thanks");
    }).catch((err) => console.error("error in addSigner: ", err));
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
                    `${i+1}. ${rows[i].first} ${rows[i].last} ${rows[i].age} ${rows[i].city}`
                );
                if (rows[i].url) {
                    var personalPage = true;
                } else {
                    personalPage = false;
                }
                console.log(signers);
            }
            res.render("signers", {
                layout: "main",
                signers,
                personalPage
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
                res.redirect("/profile");
            })
            .catch(({ detail }) => {
                console.log(detail);
                req.session.error = detail;
                res.redirect("/register");
            });
    }).catch(err => console.log(err));
});

app.get("/login", (req, res) => {
    let errorLogging = null;
    errorLogging = req.session.loggingError;
    res.render("login", {
        layout: "main",
        errorLogging
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    getPassword(email).then(({ rows }) => {
        const hash = rows[0].password;
        compare(password, hash)
            .then((booleanResult) => {
                if (booleanResult) {
                    req.session.loggingError = null;
                    req.session.userId = rows[0].id;
                    // CHECK IF USER HAVE ALREADY SIGNED!!! if so redirect to THANKS, otherwise to PETITION
                    didSigned(req.session.userId).then(({ rowCount }) => {
                        if (rowCount == 1) {
                            res.redirect("thanks");
                        } 
                        if (rowCount == 0) {
                            res.redirect("/petition");
                        }
                    });
                } else {
                    req.session.loggingError = true;
                    res.redirect("login");
                }
            });
    }).catch((err) => console.log(err));
});

app.get("/profile", (req, res) => {
    res.render("user_profile", {
        layout: "main"
    });
});

app.post("/profile", (req, res) => {
    const { age, city, personalPage } = req.body;
    addProfile(age, city, personalPage, req.session.userId)
        .then(() => {
            // console.log(result);
            res.redirect("/petition");
        }).catch((err) => console.log(err));
});


app.get("*", (req, res) => {
    res.redirect("/");
});

app.listen(8080, () => console.log("Server listening on 8080..."));
