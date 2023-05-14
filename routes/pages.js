const express = require("express");
const app = express();
const authController = require("../controllers/auth");
const staffController = require("../controllers/staff");
const studentController = require("../controllers/student");
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
router.get('/Stafflog', (req, res) => {
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
//add student
router.get('/addstudent', authController.adminisLoggedIn, (req, res) => {
    if (req.user) {
        // uname=req.user.username;
        res.sendFile("addstudent.html", { root: './public/' });
    } else {
        console.log('Login Required!');
        res.sendFile("home.html", { root: './public/' });
    }
});
router.use('/admin/addstudent', authController.addstudent, (req, res) => {
    if (req.user) {
        // uname=req.user.username;
        res.render("admindash",{username:req.user.username}),
        console.log("Student Added")
    } else {
        console.log('Login Required!');
        res.sendFile("home.html", { root: './public/' });
    }
})
//update student
router.get('/admin/updatestud', authController.adminisLoggedIn, (req, res) => {
    res.render('updatestudent', { username: req.user.username, student: null });
  });
  
// Search and update student details
router.use('/admin/updatestudentdetails', authController.searchAndUpdateStudent);
// Update student details
router.use('/admin/updatestudent', authController.updateStudentDetails);
  
  

//Notices
router.get('/admin/publishnotice', authController.adminisLoggedIn, (req, res) => {
    if (req.user) {
        // uname=req.user.username;
        res.sendFile("publishnotice.html", { root: './public/' })
    } else {
        return res.send("<script>alert('Login Required!'); window.location.href = '/';</script>");
    }
});
router.use('/publishnotice', authController.publishnotice);
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
router.use('/Regward',authController.regward, (req, res) => {
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
router.use('/regstaff',authController.regstaff, (req, res) => {
    res.render("admindash",{username:req.user.username})
});

//Change Password
router.get('/admin/changepass', authController.adminisLoggedIn, (req, res) => {
    if (req.user) {
        // uname=req.user.username;
        res.sendFile("passchange.html", { root: './public/' })
    } else {
        return res.send("<script>alert('Login Required!'); window.location.href = '/';</script>");
    }
});
router.use('/changepass',authController.adminChangePass, (req, res) => {
    res.render("admindash",{username:req.user.username})
});

//signout
router.use('/admin/signout',authController.adminlogout, (req, res) => {
    return res.send("<script>alert('Logged Out!'); window.location.href = '/';</script>");
});


// FOR STAFF
// login
router.post('/stafflog', staffController.stafflogin, (req, res) => {
    res.render("rough", { username: req.user.username });
});
router.get('/staff', staffController.staffisLoggedIn, (req, res) => {
    if (req.user) {
        res.render("rough", { username: req.user.username });
    } else {
        console.log('Login Required!');
        res.sendFile("stafflog.html", { root: './public/' });
    }
});

//Mark Attendance
router.get('/staff/markatd', staffController.staffisLoggedIn, (req, res) => {
    if (req.user) {
      const showMarkAttendance = true;
      const currentDate = new Date().toLocaleDateString('en-GB'); // Get current date in DD-MM-YY format
      db.query('SELECT * FROM attendance ORDER BY room ASC', (err, results) => {
        if (err) {
          console.log(err);
        } else {
          res.render('rough', { username: req.user.username, student: results, showMarkAttendance, today:currentDate });
        }
      });
    } else {
      console.log('Login Required!');
      res.sendFile("stafflog.html", { root: './public/' });
    }
  });
  

// change password
router.get('/staff/changepass', staffController.staffisLoggedIn, (req, res) => {
    if (req.user) {
        const showChangePassForm = true;
        res.render('rough', { username: req.user.username ,showChangePassForm });
    } else {
        console.log('Login Required!');
        res.sendFile("stafflog.html", { root: './public/' });
    }
});
router.use('/staffchangepass',staffController.staffChangePass, (req, res) => {
    res.render("rough",{username:req.user.username})
});

// sign out
router.get('/staff/signout', staffController.stafflogout, (req, res) => {
    return res.send("<script>alert('Logged Out!'); window.location.href = '/';</script>");
});

module.exports = router;