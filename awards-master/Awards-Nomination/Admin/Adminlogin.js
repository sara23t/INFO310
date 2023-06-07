var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var path = require("path");
var ejs = require("ejs");
var app = express();
var mysql = require("mysql");
const { holdReady } = require("jquery");
const { response } = require("express");
const { resolve } = require("path");
var nodemailer = require("nodemailer");
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
  con.query("SELECT * FROM administrator", function (req, res, next) {
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

app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname + "/Admin-login.html"));
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

//Award display
app.get("/awards", function (req, res, next) {
  var sq = "SELECT * FROM award";
  con.query(sq, function (err, data, fields) {
    console.log(err);
    res.render("awards", { title: "User List", userData: data });
  });
});

//User display
app.get("/user", function (req, res, next) {
  var sq = "SELECT * FROM staff";
  con.query(sq, function (err, data, fields) {
    console.log(err);
    res.render("user", { title: "User List", userData: data });
  });
});

//EDIT PAGE
app.get("/edit", function (req, res, next) {
  var sq = "SELECT * FROM nomination";
  con.query(sq, function (err, data, fields) {
    console.log(err);
    res.render("edit", { title: "User List", userData: data });
  });
});

//Login
app.post("/login", function (request, response) {
  var username = request.body.username;
  var password = request.body.password;
  if (username && password) {
    con.query(
      "SELECT * FROM administrator WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        console.log(error);
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          var sqlcl = "SELECT * FROM nomination";
          var cl = con.query(sqlcl, function (err, rows) {
            var resultArray = Object.values(JSON.parse(JSON.stringify(rows)));
            response.render("display", {
              title: "user list",
              userData: results,
            });
          });

          response.redirect("/display");
        } else {
          //response.send("Incorrect username or password");
          notifier.notify({
            title: "Warning",
            message: "UserName or Password is Incorrect",
          });
        }

        //response.end();
      }
    );
  } else {
    response.send("Please enter username and password");
    response.end();
  }
});

//Delete Nomination
app.get("/display/:nominationID", function (req, res, next) {
  var id = req.params.nominationID;
  var sql = "DELETE FROM nomination WHERE nominationID = ?";
  con.query(sql, [id], function (err, data) {
    if (err) throw err;
    console.log(data.affectedRows + " record(s) updated");
  });
  res.redirect("/display");
});

// Display staff
app.get("/user", function (req, res, next) {
  var sq = "SELECT * FROM staff";
  con.query(sq, function (err, data, fields) {
    console.log(err);
    res.render("user", { title: "User List", userData: data });
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

//Delete from staff
app.get("/user/:staffID", function (req, res, next) {
  var id = req.params.staffID;
  var sql = "DELETE FROM staff WHERE staffID = ?";
  con.query(sql, [id], function (err, data) {
    if (!err) {
      console.log(data.affectedRows + " record(s) updated");
    } else {
      console.log(err);
      notifier.notify({
        title: "Warning",
        message: "Staff member is involved in nomination(s)",
      });
    }
  });
  res.redirect("/user");
});
//Delete from awards
app.get("/awards/:awardName", function (req, res, next) {
  var id = req.params.awardName;
  var sql = "DELETE FROM award WHERE awardName = ?";
  con.query(sql, [id], function (err, data) {
    if (!err) {
      console.log(data.affectedRows + " record(s) updated");
    } else {
      console.log(err);
      notifier.notify({
        title: "Warning",
        message: "Award is involved in nomination(s)",
      });
    }
  });
  res.redirect("/awards");
});

//Edit nomination
app.get("/edit/(:nominationID)", function (req, res, next) {
  con.query(
    "SELECT * FROM nomination WHERE nominationID = ?",
    [req.params.nominationID],
    function (err, data) {
      if (!err) {
        console.log(data.affectedRows + " record(s) updated");
        res.render("edit", {
          title: "Edit Customer",
          nominationID: data[0].nominationID,
          staffID: data[0].staffID,
          awardName: data[0].awardName,
        });
      } else {
        console.log(err);
        notifier.notify({
          title: "Warning",
          message: "StaffID or Award Name is not valid\nHint: Check spelling",
        });
      }
    }
  );
});

//Edit nomination
app.post("/edit/:nominationID", function (req, res, next) {
  var id = req.params.nominationID;
  var staffID = req.body.staffID;
  var awardName = req.body.awardName;
  var sql = `UPDATE nomination SET staffID=?, awardName= ? WHERE nominationID= ?`;
  con.query(sql, [staffID, awardName, id], function (err, data) {
    if (!err) {
      console.log(data.affectedRows + " record(s) updated");
      res.redirect("/display");
    } else {
      console.log(err);
      notifier.notify({
        title: "Warning",
        message: "StaffID or Award Name is not valid\nHint: Check spelling",
      });
    }
  });
});

//Display Awards
app.get("/awards/(:awardName)", function (req, res, next) {
  con.query(
    "SELECT * FROM award WHERE awardName = ?",
    [req.params.awardName],
    function (err, data) {
      if (err) throw err;
      res.render("awards", {
        title: "award",
        awardName: data[0].awardName,
        description: data[0].description,
        panelID: data[0].panelID,
        closingDate: data[0].closingDate,
      });
      //socket.emit('awards', data);
    }
  );
});

//Create Award
app.post("/awards", function (req, res, next) {
  inputData = {
    awardName: req.body.awardName,
    description: req.body.description,
    panelID: req.body.panelID,
    closingDate: req.body.closingDate,
  };
  var sql = "INSERT INTO award SET ?";

  con.query(sql, inputData, function (err, data) {
    if (!err) {
      console.log(data.affectedRows + " record(s) updated");
      res.redirect("/awards");
    } else {
      console.log(err);
      notifier.notify({
        title: "Warning",
        message:
          "PanelID or closing date is not valid\nOr Award Name already exists",
      });
    }
  });
});

app.listen(8083);
console.log("start the localhost");
