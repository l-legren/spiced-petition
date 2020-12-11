const express = require("express");
const app = express();
exports.app = app;
const hb = require("express-handlebars");
const csurf = require("csurf");
const {
    addSigner,
    addSignUp,
    dbCounter,
    getPassword,
    getSigners,
    getSignersByCity,
    getSignerById,
    didSigned,
    addProfile,
    editProfileUsersPw,
    editProfileUsersNoPw,
    upsertingPw,
    deleteSig,
} = require("./db.js");
process.env.NODE_ENV === "production"
    ? (secrets = process.env)
    : (secrets = require("./secrets"));
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
    res.redirect("/welcome");
});

app.get("/welcome", (req, res) => {
    res.render("welcome", {
        layout: "main"
    });
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.post("/petition", (req, res) => {
    // console.log("req.body: ", req.body);
    const { signature } = req.body;
    addSigner(signature, req.session.userId)
        .then(({ rows }) => {
            req.session.signature = rows[0].signature;
            res.redirect("/thanks");
        })
        .catch((err) => console.error("error in addSigner: ", err));
});

app.get("/thanks", (req, res) => {
    const sign = req.session.signature;
    dbCounter()
        .then(({ rows }) => {
            res.render("thanks", {
                main: "layout",
                counter: rows[0].count,
                sign,
            });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post("/thanks", (req, res) => {
    // const { dltButton } = req.body;
    deleteSig(req.session.userId)
        .then(() => {
            req.session.signature = null;
            res.redirect("/petition");
        })
        .catch((err) => console.log("Error deleting Signature", err));
});

app.get("/petition/signed", (req, res) => {
    getSigners()
        .then(({ rows }) => {
            // console.log(rows);
            res.render("signers", {
                layout: "main",
                rows,
            });
        })
        .catch((err) => console.error(err));
});

app.get("/petition/signed/:city", (req, res) => {
    const { city } = req.params;
    const cityLower = city.toLowerCase();
    getSigners().then(({ rows }) => {
        // console.log(rows.length);
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].city == cityLower) {
                getSignersByCity(cityLower).then(({ rows }) => {
                    // console.log(rows);
                    res.render("signers", {
                        layout: "main",
                        rows,
                    });
                });
            }
        }
    });
});

app.get("/register", (req, res) => {
    let errorSigning = req.session.error;
    res.render("register", {
        layout: "main",
        errorSigning,
    });
});

app.post("/register", (req, res) => {
    const { first, last, email, password } = req.body;
    hash(password)
        .then((hash) => {
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
        })
        .catch((err) => console.log(err));
});

app.get("/login", (req, res) => {
    let errorLogging = null;
    errorLogging = req.session.loggingError;
    res.render("login", {
        layout: "main",
        errorLogging,
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    getPassword(email)
        .then(({ rows }) => {
            const hash = rows[0].password;
            compare(password, hash).then((booleanResult) => {
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
        })
        .catch((err) => console.log(err));
});

app.get("/profile", (req, res) => {
    res.render("user_profile", {
        layout: "main",
    });
});

app.post("/profile", (req, res) => {
    const { age, city, personalPage } = req.body;
    addProfile(age, city, personalPage, req.session.userId)
        .then(() => {
            res.redirect("/petition");
        })
        .catch((err) => console.log(err));
});

app.get("/edit", (req, res) => {
    // console.log(req.session.userId);
    getSignerById(req.session.userId).then(({ rows }) => {
        // console.log(rows);
        res.render("edit", {
            layout: "main",
            rows,
            helpers: {
                makeCityCapital(city) {
                    let cityCap = city.charAt(0).toUpperCase() + city.slice(1);
                    return cityCap;
                },
            },
        });
    });
});

app.post("/edit", (req, res) => {
    const { first, last, email, password, city, age, website } = req.body;
    if (password) {
        hash(password)
            .then((hash) => {
                console.log("hash produced");
                editProfileUsersPw(first, last, email, hash, req.session.userId)
                    .then(() => {
                        // when password is not entered not working
                        upsertingPw(city, age, website, req.session.userId)
                            .then(() => {
                                console.log("table upserted");
                                res.redirect("/thanks");
                            })
                            .catch((err) => console.log("error upsertin", err));
                    })
                    .catch((err) => console.log("error editing", err));
            })
            .catch((err) => console.log("error in hash", err));
    } else {
        editProfileUsersNoPw(first, last, email, req.session.userId)
            .then(() => {
                upsertingPw(city, age, website, req.session.userId)
                    .then(() => {
                        res.redirect("/thanks");
                    })
                    .catch((err) => console.log("error upserting", err));
            })
            .catch((err) => console.log("error updating", err));
    }
});

app.get("*", (req, res) => {
    res.redirect("/");
});

if (require.main == module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log("Server running on port 8080")
    );
}
