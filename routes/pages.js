const express = require("express");
const app = express();
const authController = require("../controllers/auth");
const student = require("../controllers/student");
const router = express.Router();

const mysql = require("mysql");
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

app.use(express.static('public'));


router.get('/', (req, res) => {
    res.sendFile("home.html", { root: './public/' })
});
router.get('/NoticeBoard', (req, res) => {
    db.query('SELECT * FROM notices', (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.render('NoticeBoard', { notices: results });
      }
    });
  });

//login Categories
router.get('/Adminlog', (req, res) => {
    res.sendFile("adminlog.html", { root: './public/' })
});
router.get('/Stafflogin', (req, res) => {
    res.sendFile("stafflog.html", { root: './public/' })
});
router.get('/Studlog', (req, res) => {
    res.sendFile("studentlog.html", { root: './public/' })
});
router.get('/wardlog', (req, res) => {
    res.sendFile("wardenlog.html", { root: './public/' })
});

//admin Routes
router.use('/adminlogin',authController.adminlogin, (req, res) => {
    res.render("admindash",{username:req.user.username})
});
router.get('/admin', authController.adminisLoggedIn, (req, res) => {
    if (req.user) {
        // uname=req.user.username;
        res.render("admindash",{username:req.user.username})
    } else {
        console.log('Login Required!');
        res.sendFile("adminlog.html", { root: './public/' });
    }
});
router.get('/addstudent', authController.adminisLoggedIn, (req, res) => {
    if (req.user) {
        // uname=req.user.username;
        res.sendFile("addstudent.html", { root: './public/' });
    } else {
        console.log('Login Required!');
        res.sendFile("home.html", { root: './public/' });
    }
});
router.use('/admin/addstudent', student.add, (req, res) => {
    if (req.user) {
        // uname=req.user.username;
        res.render("admindash",{username:req.user.username}),
        console.log("Student Added")
    } else {
        console.log('Login Required!');
        res.sendFile("home.html", { root: './public/' });
    }
})
//Notices
router.get('/admin/publishnotice', authController.adminisLoggedIn, (req, res) => {
    if (req.user) {
        // uname=req.user.username;
        res.sendFile("publishnotice.html", { root: './public/' })
    } else {
        return res.send("<script>alert('Login Required!'); window.location.href = '/';</script>");
    }
});

router.get('/admin/notices',authController.adminisLoggedIn, (req, res) => {
    db.query('SELECT * FROM notices', (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.render('Notices', { notices: results, username: req.user.username });

      }
    });
  });

router.post('/delete-notice', (req, res) => {
  const noticeId = req.body.noticeId;
  db.query('DELETE FROM notices WHERE id = ?', [noticeId], (err, results) => {
    if (err) {
      console.log(err);
    } else {
        return res.send("<script>alert('Notice deleted successfully!'); window.location.href = '/admin';</script>");

    }
  });
});

//Register Warden
router.get('/admin/regward', authController.adminisLoggedIn, (req, res) => {
    if (req.user) {
        // uname=req.user.username;
        res.sendFile("RegisterWarden.html", { root: './public/' })
    } else {
        return res.send("<script>alert('Login Required!'); window.location.href = '/';</script>");
    }
});
router.use('/publishnotice',authController.publishnotice, (req, res) => {
    res.render("admindash",{username:req.user.username})
});
//Register Staff
router.get('/admin/regstaff', authController.adminisLoggedIn, (req, res) => {
    if (req.user) {
        // uname=req.user.username;
        res.sendFile("RegisterStaff.html", { root: './public/' })
    } else {
        return res.send("<script>alert('Login Required!'); window.location.href = '/';</script>");
    }
});
router.use('/publishnotice',authController.publishnotice, (req, res) => {
    res.render("admindash",{username:req.user.username})
});

//signout
router.use('/admin/signout',authController.adminlogout, (req, res) => {
    return res.send("<script>alert('Logged Out!'); window.location.href = '/';</script>");
});


module.exports = router;