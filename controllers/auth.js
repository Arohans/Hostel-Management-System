const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const path=require('path');

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
exports.adminlogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).sendFile(path.resolve(__dirname, "../public/adminlog.html"), {
                message: "Please Provide an username and password"
            })
        }
        db.query('SELECT * FROM adminlog WHERE username = ?', [username], async (err, results) => {
            // console.log(results);
            if (!results || results.length == 0 || !await bcrypt.compare(password, results[0].password)) {
                return res.send("<script>alert('Username or Password is incorrect'); window.location.href = '/adminlog';</script>");
                
            } else {
                const username = results[0].username;

                const token = jwt.sign({ username }, process.env.JWT_SECRET, {
                    expiresIn: 7776000
                });

                console.log("the token is " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }
                res.cookie('userSave', token, cookieOptions);
                res.status(200).redirect("/admin");
            }
        })
    } catch (err) {
        console.log(err);
    }
}
exports.adminisLoggedIn = async (req, res, next) => {
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

exports.publishnotice = (req, res) => {
    console.log(req.body);
    
    // Get the current date
    const currentDate = new Date();

    const { heading,nbody } = req.body;
    db.query('INSERT INTO notices SET ?', { heading: heading, nbody:nbody, created_at:currentDate }, (err, results) => {
        if (err) {
            console.log(err);
        } else {
            return res.send("<script>alert('Notice Published!'); window.location.href = '/admin';</script>");
        }
    })
    
}

exports.regstaff = async (req, res) => {
    const { username,name,phone} = req.body;
    const password = username + '@' + phone;
  
      let hashedPassword = await bcrypt.hash(password, 8);
            db.query('INSERT INTO staff SET ?', { username:username, name: name, phone: phone, password: hashedPassword }, (err, results) => {
                if (err) {
                    console.log(err);
                } else {
                    return res.send("<script>alert('Registered Successfully!'); window.location.href = '/admin';</script>");
                }
            })
           
}

exports.adminlogout = (req, res) => {
    res.cookie('userSave', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    res.status(200).redirect("/");
}