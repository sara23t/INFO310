var mysql = require("mysql");
var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var path = require("path");
var http = require("http");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var url = require("url");
var fs = require("fs");
var jsdom = require("jsdom");
var $ = require("jquery")(new jsdom.JSDOM().window);
var ejs = require("ejs");
var notifier = require("node-notifier");

var connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "password",
  database: "info310project",
});

connection.connect();
module.exports = connection;

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Logon Page
app.get("/Staff", function (request, response) {
  response.sendFile(path.join(__dirname + "/login.html"));
});

app.get("/shoot", function (request, response) {
  response.sendFile(path.join(__dirname + "/reviewerLogin.html"));
});

app.get("/admin", function (request, response) {
  response.sendFile(path.join(__dirname + "/Admin-login.html"));
});
app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname + "/Home.html"));
});

//Form Page
app.get("/form", function (request, response) {
  response.sendFile(path.join(__dirname + "/Form.html"));
});

//Confirmation page
app.get("/confirmation", function (request, response) {
  response.sendFile(path.join(__dirname + "/Confirmation.html"));
});

//DeConfirmation page
app.get("/deconfirmation", function (request, response) {
  response.sendFile(path.join(__dirname + "/Deconfirmation.html"));
});

//Logout
app.get("/logout", (req, res) => {
  res.clearCookie("nToken");
  return res.redirect("/");
});

//nominate
app.get("/nominate", (req, res) => {
  //res.clearCookie("nToken");
  return res.redirect("/form");
});

//Back button
app.get("/back", (req, res) => {
  res.clearCookie("nToken");
  return res.redirect("/form");
});

//Awards button
app.get("/awards", (req, res) => {
  res.clearCookie("nToken");
  return res.redirect("/displayst");
});

//For displaying Awards
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

// Staff award display
app.get("/displayst", function (req, res, next) {
  var sq = "SELECT * FROM award";
  connection.query(sq, function (err, data, fields) {
    console.log(err);
    res.render("displayst", { title: "User List", userData: data });
  });
});

//recipent display
app.get("/recipientsrv", function (req, res, next) {
  var sq = "SELECT * FROM recipients";
  connection.query(sq, function (err, data, fields) {
    console.log(err);
    res.render("recipientsrv", { title: "User List", userData: data });
  });
});

//recipent Add
app.get("/confirm/:nominationID", function (req, res, next) {
  var nomID = req.params.nominationID;
  var sql =
    "INSERT INTO recipients (staffID, awardName) SELECT staffID, awardName FROM nomination WHERE nominationID = ?";
  connection.query(sql, [nomID], function (err, data) {
    if (!err) {
      console.log(data.affectedRows + " record(s) added");
      return res.redirect("/recipientsrv");
    } else {
      console.log(err.message);
      notifier.notify({
        title: "Warning",
        message: "This Award already has a Recipient",
      });
    }
  });
});

//recipent Delete
app.get("/recipients/:awardName", function (req, res, next) {
  var id = req.params.awardName;
  var sql = "DELETE FROM recipients WHERE awardName = ?";
  connection.query(sql, [id], function (err, data) {
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
  res.redirect("/recipientsrv");
});

//Login
app.post("/auth", function (request, response) {
  var username = request.body.username;
  var password = request.body.password;
  if (!username && password) {
    response.send("Please enter username and password");
  } else {
    connection.query(
      "SELECT * FROM staff WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        console.log(error);
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          response.redirect("/displayst");
        } else {
          notifier.notify({
            title: "Warning",
            message: "UserName or Password is Incorrect",
          });
        }
        //response.end();
      }
    );
  }
});

//Form
app.post("/userInfo", function (req, res, next) {
  inputData = {
    staffID: req.body.nomines,
    awardName: req.body.award,
  };
  var sql = "INSERT INTO nomination SET ?";

  connection.query(sql, inputData, function (err, data) {
    if (!err) {
      return res.redirect("/confirmation");
    } else {
      console.log(err.message);
      notifier.notify({
        title: "Warning",
        message: "StaffID or Award Name is Incorrect\nHint: Check spelling",
      });
    }
  });
});

// Reviewer

const { holdReady } = require("jquery");
const nodemailer = require("nodemailer");
const { response } = require("express");

app.post("/", function (req, res, next) {
  connection.query("SELECT * FROM reviewer", function (req, res, next) {
    console.log(result);
  });
  console.log("Database is connected!");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Logon page
app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname + "/reviewerLogin.html"));
});

//Nomination displayrvrv
app.get("/displayrv", function (req, res, next) {
  var sq = "SELECT * FROM nomination";
  connection.query(sq, function (err, data, fields) {
    console.log(err);
    res.render("displayrv", { title: "User List", userData: data });
  });
});

//recipent displayrvrv
app.get("/recipentsrv", function (req, res, next) {
  var sq = "SELECT * FROM recipents";
  connection.query(sq, function (err, data, fields) {
    console.log(err);
    res.render("recipentsrv", { title: "User List", userData: data });
  });
});

//Login Staff
app.post("/auths", function (request, response) {
  var username = request.body.username;
  var password = request.body.password;
  if (!username && password) {
    response.send("Please enter username and password");
  } else {
    connection.query(
      "SELECT * FROM reviewer WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        console.log(error);
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          response.redirect("/displayrv");
        } else {
          notifier.notify({
            title: "Warning",
            message: "UserName or Password is Incorrect",
          });
        }
        //response.end();
      }
    );
  }
});

//Delete
app.get("/displayrv/:nominationID", function (req, res, next) {
  var id = req.params.nominationID;
  var sql = "DELETE FROM nomination WHERE nominationID = ?";
  connection.query(sql, [id], function (err, data) {
    if (err) throw err;
    console.log(data.affectedRows + " record(s) updated");
  });
  res.redirect("/displayrv");
});

//Back button
app.get("/back", (req, res) => {
  res.clearCookie("nToken");
  return res.redirect("/displayrv");
});

//Logout
app.get("/logout", (req, res) => {
  res.clearCookie("nToken");
  return res.redirect("/");
});

app.get("/emailrv", function (req, res, next) {
  res.render("emailrv", { title: "Send Mail with nodejs" });
});
app.post("/emailrv", function (req, res) {
  var receiver = req.body.to;
  var subject = req.body.subject;
  var message = req.body.message;

  var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "commerceawardsnomination@gmail.com", // enter your emailrv address
      pass: "qwvusbiiwhmiippj", // enter your visible/encripted password
    },
  });

  var mailOptions = {
    from: "commerceawardsnomination@gmail.com",
    to: receiver,
    subject: subject,
    text: message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error.message);
      notifier.notify({
        title: "Warning",
        message: "Email failed to send",
      });
    } else {
      console.log("Email was sent successfully: " + info.response);
      notifier.notify({
        title: "Message",
        message: "Email was sent successfully",
      });
      return res.redirect("/recipientsrv");
    }

    res.render("emailrv", { title: "Send Mail with nodejs" });
  });
});

// admin

app.post("/", function (req, res, next) {
  connection.query("SELECT * FROM administrator", function (req, res, next) {
    console.log(result);
  });
  console.log("Database is connected!");
});

//Nomination displayAd
app.get("/displayAd", function (req, res, next) {
  var sq = "SELECT * FROM nomination";
  connection.query(sq, function (err, data, fields) {
    console.log(err);
    res.render("displayAd", { title: "User List", userData: data });
  });
});

//Award displayAd
app.get("/awardsAd", function (req, res, next) {
  var sq = "SELECT * FROM award";
  connection.query(sq, function (err, data, fields) {
    console.log(err);
    res.render("awardsAd", { title: "User List", userData: data });
  });
});

//User displayAd
app.get("/userAd", function (req, res, next) {
  var sq = "SELECT * FROM staff";
  connection.query(sq, function (err, data, fields) {
    console.log(err);
    res.render("userAd", { title: "User List", userData: data });
  });
});

//EDIT PAGE
app.get("/editAd", function (req, res, next) {
  var sq = "SELECT * FROM nomination";
  connection.query(sq, function (err, data, fields) {
    console.log(err);
    res.render("editAd", { title: "User List", userData: data });
  });
});

//Login Admin
app.post("/login", function (request, response) {
  var username = request.body.username;
  var password = request.body.password;
  if (username && password) {
    connection.query(
      "SELECT * FROM administrator WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        console.log(error);
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          var sqlcl = "SELECT * FROM nomination";
          var cl = connection.query(sqlcl, function (err, rows) {
            var resultArray = Object.values(JSON.parse(JSON.stringify(rows)));
            response.render("displayAd", {
              title: "user list",
              userData: results,
            });
          });

          response.redirect("/displayAd");
        } else {
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

app.get("/displayAd/:nominationID", function (req, res, next) {
  var id = req.params.nominationID;
  var sql = "DELETE FROM nomination WHERE nominationID = ?";
  connection.query(sql, [id], function (err, data) {
    if (err) throw err;
    console.log(data.affectedRows + " record(s) updated");
  });
  res.redirect("/displayAd");
});

//Back button
app.get("/back", (req, res) => {
  res.clearCookie("nToken");
  return res.redirect("/displayAd");
});

//Logout
app.get("/logout", (req, res) => {
  res.clearCookie("nToken");
  return res.redirect("/");
});

//Delete from staff
app.get("/userAd/:staffID", function (req, res, next) {
  var id = req.params.staffID;
  var sql = "DELETE FROM staff WHERE staffID = ?";
  connection.query(sql, [id], function (err, data) {
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
  res.redirect("/userAd");
});
//Delete from awardsAd
app.get("/awardsAd/:awardName", function (req, res, next) {
  var id = req.params.awardName;
  var sql = "DELETE FROM award WHERE awardName = ?";
  connection.query(sql, [id], function (err, data) {
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
  res.redirect("/awardsAd");
});

//Edit nomination
app.get("/editAd/(:nominationID)", function (req, res, next) {
  connection.query(
    "SELECT * FROM nomination WHERE nominationID = ?",
    [req.params.nominationID],
    function (err, data) {
      if (!err) {
        console.log(data.affectedRows + " record(s) updated");
        res.render("editAd", {
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
app.post("/editAd/:nominationID", function (req, res, next) {
  var id = req.params.nominationID;
  var staffID = req.body.staffID;
  var awardName = req.body.awardName;
  var sql = `UPDATE nomination SET staffID=?, awardName= ? WHERE nominationID= ?`;
  connection.query(sql, [staffID, awardName, id], function (err, data) {
    if (!err) {
      console.log(data.affectedRows + " record(s) updated");
      res.redirect("/displayAd");
    } else {
      console.log(err);
      notifier.notify({
        title: "Warning",
        message: "StaffID or Award Name is not valid\nHint: Check spelling",
      });
    }
  });
});

app.get("/awardsAd/(:awardName)", function (req, res, next) {
  connection.query(
    "SELECT * FROM award WHERE awardName = ?",
    [req.params.awardName],
    function (err, data) {
      if (err) throw err;
      res.render("awardsAd", {
        title: "award",
        awardName: data[0].awardName,
        description: data[0].description,
        panelID: data[0].panelID,
        closingDate: data[0].closingDate,
      });
      //socket.emit('awardsAd', data);
    }
  );
});

// Add Award
app.post("/awardsAd", function (req, res, next) {
  inputData = {
    awardName: req.body.awardName,
    description: req.body.description,
    panelID: req.body.panelID,
    closingDate: req.body.closingDate,
  };
  var sql = "INSERT INTO award SET ?";

  connection.query(sql, inputData, function (err, data) {
    if (!err) {
      console.log(data.affectedRows + " record(s) updated");
      res.redirect("/awardsAd");
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

app.get("/emailAd", function (req, res, next) {
  res.render("emailAd", { title: "Send Mail with nodejs" });
});
app.post("/emailAd", function (req, res) {
  var receiver = req.body.to;
  var subject = req.body.subject;
  var message = req.body.message;

  var transporter = nodemailer.createTransport({
    service: "gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "taha.s20001@gmail.com", // enter your emailAd address
      pass: "sarataha123", // enter your visible/encripted password
    },
  });

  var mailOptions = {
    from: "s.taha20001@gmail.com",
    to: receiver,
    subject: subject,
    text: message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(err);
      notifier.notify({
        title: "Warning",
        message: "Email did not send. \nCheck Email address",
      });
    } else {
      console.log("Email was sent successfully: " + info.response);
      res.redirect("/recipientsrv");
    }
  });
  res.render("emailAd", { title: "Send Mail with nodejs" });
});

app.listen(8081);
console.log("start the localhost");
console.log("Using Localhost 8081\nhttp://localhost:8081/");
