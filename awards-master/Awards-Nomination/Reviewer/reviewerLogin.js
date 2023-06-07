var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var path = require("path");
var ejs = require("ejs");
var app = express();
var mysql = require("mysql");
const { holdReady } = require("jquery");
const nodemailer = require("nodemailer");
const notifier = require("node-notifier");

var con = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "password",
  database: "info310project",
});

con.connect();
module.exports = con;

app.post("/", function (req, res, next) {
  con.query("SELECT * FROM reviewer", function (req, res, next) {
    console.log(result);
  });
  console.log("Database is connected!");
});

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Logon page
app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname + "/reviewerLogin.html"));
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//Nomination display
app.get("/display", function (req, res, next) {
  var sq = "SELECT * FROM nomination";
  con.query(sq, function (err, data, fields) {
    console.log(err);
    res.render("display", { title: "User List", userData: data });
  });
});

//recipent display
app.get("/recipients", function (req, res, next) {
  var sq = "SELECT * FROM recipients";
  con.query(sq, function (err, data, fields) {
    console.log(err);
    res.render("recipients", { title: "User List", userData: data });
  });
});

//Login
app.post("/auth", function (request, response) {
  var username = request.body.username;
  var password = request.body.password;
  if (!username && password) {
    response.send("Please enter username and password");
  } else {
    con.query(
      "SELECT * FROM reviewer WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        console.log(error);
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          response.redirect("/display");
        } else {
          notifier.notify({
            title: "Warning",
            message: "UserName or Password is Incorrect",
          });
          //response.send("Incorrect username or password");
        }
        //response.end();
      }
    );
  }
});

//Nomination Delete
app.get("/display/:nominationID", function (req, res, next) {
  var id = req.params.nominationID;
  var sql = "DELETE FROM nomination WHERE nominationID = ?";
  con.query(sql, [id], function (err, data) {
    if (!err) {
      console.log(data.affectedRows + " record(s) updated");
    } else {
      console.log(err);
      notifier.notify({
        title: "Warning",
        message: "Invalid",
      });
    }
  });
  res.redirect("/display");
});

//recipent Delete
app.get("/recipients/:awardName", function (req, res, next) {
  var id = req.params.awardName;
  var sql = "DELETE FROM recipients WHERE awardName = ?";
  con.query(sql, [id], function (err, data) {
    if (!err) {
      console.log(data.affectedRows + " record(s) updated");
    } else {
      console.log(err);
      notifier.notify({
        title: "Warning",
        message: "Invalid",
      });
    }
  });
  res.redirect("/recipients");
});

//recipent Add
app.get("/confirm/:nominationID", function (req, res, next) {
  var nomID = req.params.nominationID;
  var sql =
    "INSERT INTO recipients (staffID, awardName) SELECT staffID, awardName FROM nomination WHERE nominationID = ?";
  con.query(sql, [nomID], function (err, data) {
    if (!err) {
      console.log(data.affectedRows + " record(s) added");
      return res.redirect("/recipients");
    } else {
      console.log(err.message);
      notifier.notify({
        title: "Warning",
        message: "This Award already has a Recipient",
      });
    }
  });
});

//Back button
app.get("/back", (req, res) => {
  res.clearCookie("nToken");
  return res.redirect("/display");
});

//Logout
app.get("/logout", (req, res) => {
  res.clearCookie("nToken");
  return res.redirect("/");
});

app.get("/email", function (req, res, next) {
  res.render("email", { title: "Send Mail with nodejs" });
});
app.post("/email", function (req, res) {
  var receiver = req.body.to;
  var subject = req.body.subject;
  var message = req.body.message;

  var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "taha.s20001@gmail.com", // enter your email address
      pass: "qomfwiosldsuxqrs", // enter your visible/encripted password
    },
  });

  var mailOptions = {
    from: "taha.s20001@gmail.com",
    to: receiver,
    subject: subject,
    text: message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email was sent successfully: " + info.response);
    }

    res.render("email", { title: "Send Mail with nodejs" });
  });
});
app.listen(8086);

console.log("start localhost");
