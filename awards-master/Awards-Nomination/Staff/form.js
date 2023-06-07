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

var connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "password",
  database: "info310project",
});

connection.connect();

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

app.get("/", function (request, response) {
  request.session.username;
  response.sendFile(path.join(__dirname + "/login.html"));
});

app.get("/form", function (request, response) {
  response.sendFile(path.join(__dirname + "/Form.html"));
});

app.get("/confirm", function (request, response) {
  response.sendFile(path.join(__dirname + "/confirm.html"));
});

/* app.post('/auth', function (request, response) {
    var username = request.body.username;
    var password = request.body.password;
    if (!username && password) {
        response.send('Please enter username and password');

    } else {
        connection.query('SELECT * FROM user WHERE username = ? AND user_password = ?',
            [username, password], function (error, results, fields) {
                console.log(error);
                if (results.length > 0) {
                    request.session.loggedin = true;
                    request.session.username = username;
                    response.redirect('/form');
                } else {
                    response.send('Incorrect username or password');
                }
                response.end();


            });

    }
}); */
/* app.post('/userInfo', function (req, res, next) {

    inputData = {
        username: req.session.username,
        awardName: req.body.nomines
    }
    var sql = 'INSERT INTO nomination SET ?';

    connection.query(sql, inputData, function (err, data) {
        if (err) {

            console.log(err);
        } else {

            res.redirect('/Login');
        }
        response.end();
    });

}); */

app.listen(8082);
