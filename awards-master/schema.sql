-- Table schema --

DROP TABLE recipients;
DROP TABLE administrator;
DROP TABLE reviewer;
DROP TABLE nomination;
DROP TABLE staff;
DROP TABLE award;
DROP TABLE panel;


CREATE TABLE IF NOT EXISTS panel (
    panelID  VARCHAR(4) NOT NULL,
    PRIMARY KEY (panelID),
    UNIQUE (panelID)
);

CREATE TABLE IF NOT EXISTS administrator (
    adminID    VARCHAR(4) NOT NULL,
    fname   VARCHAR(15) NOT NULL,
    lname VARCHAR(15) NOT NULL,
    phoneNumber  VARCHAR(11),
    email  varchar(30) NOT NULL,
    userName VARCHAR(8) NOT NULL, 
    PASSWORD VARCHAR(35),
    PRIMARY KEY (adminID),
    UNIQUE (adminID, userName)
);


CREATE TABLE IF NOT EXISTS reviewer (
    reviewerID    VARCHAR(4) NOT NULL,
    panelID     VARCHAR(4) NOT NULL,
    fname   VARCHAR(15) NOT NULL,
    lname VARCHAR(15) NOT NULL,
    phoneNumber  VARCHAR(11),
    email  varchar(30) NOT NULL,
    userName VARCHAR(8) NOT NULL, 
    PASSWORD VARCHAR(35),
    PRIMARY KEY (reviewerID),
    FOREIGN KEY (panelID) REFERENCES panel(panelID),
    UNIQUE (reviewerID, userName)
);

CREATE TABLE IF NOT EXISTS staff (
    staffID    VARCHAR(4) NOT NULL,
    fname   VARCHAR(15) NOT NULL,
    lname VARCHAR(15) NOT NULL,
    phoneNumber  VARCHAR(11),
    email  varchar(30) NOT NULL,
    userName VARCHAR(8) NOT NULL, 
    PASSWORD VARCHAR(35),
    PRIMARY KEY (staffID),
    UNIQUE (staffID, userName)
);

CREATE TABLE IF NOT EXISTS award (
    awardName  VARCHAR(30) NOT NULL,
    description VARCHAR(150),
    panelID VARCHAR(4) NOT NULL,
    closingDate DATE,
    PRIMARY KEY (awardName),
    FOREIGN KEY (panelID) REFERENCES panel(panelID),
    UNIQUE (awardName)
);

CREATE TABLE IF NOT EXISTS nomination (
    nominationID  INT NOT NULL AUTO_INCREMENT,
    staffID VARCHAR(4) NOT NULL,
    awardName VARCHAR(30) NOT NULL,
    PRIMARY KEY (nominationID),
    FOREIGN KEY (staffID) REFERENCES staff(staffID),
    FOREIGN KEY (awardName) REFERENCES award(awardName),
    UNIQUE (nominationID)
);


CREATE TABLE IF NOT EXISTS recipients (
    staffID VARCHAR(4) NOT NULL,
    awardName VARCHAR(30) NOT NULL,
    UNIQUE (awardName)
);







-- Insert Statements --

INSERT INTO staff VALUES("1111", "Brain", "Whitcols", "0272993987", "brain.whit@gmail.com", "whibr111", "password");
INSERT INTO staff VALUES("2222", "Grace", "Lemons", "0276147298", "grace@outlook.com", "lemgr222", "password");
INSERT INTO staff VALUES("3333", "Brett", "Jones", "0278987678", "b.jone@gmail.com", "jonbr333", "password");
INSERT INTO staff VALUES("4444", "Flecther", "Williams", "0217811234", "flec.will@clear.net.nz", "wilfl444", "password");
INSERT INTO staff VALUES("5555", "Trevor", "Brown", "0201019229", "tr.brown@gmail.com", "brotr555", "password");
INSERT INTO staff VALUES("6666", "Kate", "Mayers", "2077811262", "kate.may@outlook.com", "mayka666", "password");

INSERT INTO administrator VALUES("0001", "Hugh", "Lerry", "0219274285", "hugh.lerry@gmail.com", "lerhu001", "password");
INSERT INTO administrator VALUES("0002", "Peter", "Grant", "0201833226", "pete.g@outlook.com", "grape002", "password");
INSERT INTO administrator VALUES("0003", "Karen", "Kirkness", "0278955704", "k.kirkness@gmail.com", "kirka003", "password");
INSERT INTO administrator VALUES("0004", "Alison", "Day", "02131247892", "ally.day@clear.net.nz", "dayal004", "password");
INSERT INTO administrator VALUES("0005", "Scott", "Patterson", "0274302739", "s.patter@gmail.com", "patsc005", "password");
INSERT INTO administrator VALUES("0006", "Bruce", "Robbins", "0274123265", "bat.robbin@outlook.com", "robbr006", "password");



INSERT INTO panel VALUES("p001");
INSERT INTO panel VALUES("p002");
INSERT INTO panel VALUES("p003");
INSERT INTO panel VALUES("p004");
INSERT INTO panel VALUES("p005");
INSERT INTO panel VALUES("p006");
INSERT INTO panel VALUES("p007");

INSERT INTO reviewer VALUES("9991", "p001", "John", "King", "0218499385", "king@gmail.com", "kinjo991", "password");
INSERT INTO reviewer VALUES("9992", "p001", "Lenord", "James", "0278395739", "l.james@outlook.com", "jamle992", "password");
INSERT INTO reviewer VALUES("9993", "p002", "Sophie", "Kurt", "0205728831", "s.kurt@gmail.com", "kurso993", "password");
INSERT INTO reviewer VALUES("9994", "p002", "Francis", "Walker", "0207855944", "franciswalker@clear.net.nz", "walfr994", "password");
INSERT INTO reviewer VALUES("9995", "p003", "Luke", "Pearson", "0215559898", "luke.pearson@gmail.com", "pealu995", "password");
INSERT INTO reviewer VALUES("9996", "p003", "Kate", "Hill", "0271051057", "kt.hill@outlook.com", "hilka996", "password");


INSERT INTO award VALUES("Health, Safety and Well-Being", "These awards are available to all staff to recognise their commitment to health and safety", "p001", '2031-01-01' );
INSERT INTO award VALUES("Sustainable Practice", "These awards have been instituted as a means of recognising and rewarding staff who have made an outstanding contribution to sustainability.", "p002", '2031-02-01');
INSERT INTO award VALUES("Exceptional Performance", "Award for exceptional performance by professional staff.", "p003", '2031-01-03');

INSERT INTO nomination(staffID, awardName) VALUES( "1111", "Health, Safety and Well-Being");
INSERT INTO nomination(staffID, awardName) VALUES( "1111", "Health, Safety and Well-Being");
INSERT INTO nomination(staffID, awardName) VALUES( "1111", "Sustainable Practice");


INSERT INTO recipients VALUES("1111", "Health, Safety and Well-Being");
