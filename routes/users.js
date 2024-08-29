const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const user = require("../model/usermodel");
const userController = require("../controller/usercontroller");
// const jobrouter=require('./jobRoutes')

router.get("/", userController.home);
router.get("/loginpage", userController.loginpage);

router.get("/profile", userController.userprofile);
router.get("/logout", userController.logout);

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    // Check if the user already exists
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email already in use");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the provided name, email, and hashed password
    const newUser = new user({
      name,
      email,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();

    // Redirect to the login page after successful registration
    res.redirect("/loginpage");
  } catch (error) {
    res.status(500).send("Error registering user: " + error.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    // Find user by email
    const User = await user.findOne({ email });
    if (!User) {
      return res.redirect('/loginpage');
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, User.password);
    if (!isMatch) {
      return res.redirect('/loginpage');
    }

    // If login is successful, store the user ID and name in the session
    req.session.userID = User._id;
    req.session.userName = User.name;

    // Redirect to the home page after successful login
    res.redirect("/job");
  } catch (error) {
    res.status(500).send("Error logging in: " + error.message);
  }
});


router.get("/postnewjob", userController.showJobForm);
router.get("/job", userController.jobs);
router.post("/jobs", userController.createJob);
router.get("/job/:id", userController.showJobDetails);

// Route to render the edit job form
router.get("/job/:id/edit", userController.editJobForm);

// Route to handle the update job form submission
router.post("/job/:id/update", userController.updateJob);

// Route to handle the delete job action
router.post("/job/:id/delete", userController.deleteJob);

router.post("/apply", userController.applyForJob);

router.get("/applications", userController.viewApplications);

module.exports = router;
