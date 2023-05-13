const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const path=require('path');
const mailsender= require("./mailsender");

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

// function generatePassword(length) {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let password = '';
  
//     for (let i = 0; i < length; i++) {
//       const randomIndex = Math.floor(Math.random() * characters.length);
//       password += characters.charAt(randomIndex);
//     }
  
//     return password;
//   }

exports.add = (req, res) => {
    console.log(req.body);
    const { enrollment, name, phone, parentphone, room, zipcode, city, state, address } = req.body;
    db.query('SELECT enrollment from students WHERE enrollment = ?', [enrollment], async (err, results) => {
      if (err) {
        console.log(err);
      } else {
        if (results.length > 0) {
          return res.send("<script>alert('Student Already Registered!'); window.location.href = '/addstudent';</script>");
        }
      }
  
      const password = parentphone;
      console.log(password);
  
      let hashedPassword = await bcrypt.hash(password, 8);
      console.log(hashedPassword);
  
      const email = enrollment + '@juetguna.in';
      console.log(email);
  
      db.query('INSERT INTO students SET ?',
        {
          enrollment: enrollment,
          name: name,
          phone: phone,
          parentphone: parentphone,
          room: room,
          zipcode: zipcode,
          city: city,
          state: state,
          address: address,
          password: hashedPassword
        },
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            // const toEmail = email;
            // const subject = 'Password for HMS login';
            // const message = password;
  
            // mailsender.sendEmail(toEmail, subject, message); // Call the sendEmail function from the emailModule
  
            return res.send("<script>alert('Student Registered Successfully!'); window.location.href = '/adminlogin';</script>");
          }
        });
    });
  };
  
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).sendFile(__dirname + "/login.html", {
                message: "Please Provide an email and password"
            })
        }
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            console.log(results);
            if (!results || !await bcrypt.compare(password, results[0].password)) {
                res.status(401).sendFile(__dirname + '/login.html', {
                    message: 'Email or Password is incorrect'
                })
            } else {
                const id = results[0].id;

                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                console.log("the token is " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }
                res.cookie('userSave', token, cookieOptions);
                res.status(200).redirect("/");
            }
        })
    } catch (err) {
        console.log(err);
    }
}

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.userSave) {
        try {
            // 1. Verify the token
            const decoded = await promisify(jwt.verify)(req.cookies.userSave,
                process.env.JWT_SECRET
            );
            console.log(decoded.username);

            // 2. Check if the user still exist
            db.query('SELECT * FROM adminlog WHERE username = ?', [decoded.username], (err, results) => {
                console.log(results);
                if (!results) {
                    return next();
                }
                req.user = results[0];
                return next();
            });
        } catch (err) {
            console.log(err)
            return next();
        }
    } else {
        next();
    }
}

exports.logout = (req, res) => {
    res.cookie('userSave', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    res.status(200).redirect("/");
}