const { render } = require("ejs");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const user = require("../model/usermodel");
const Job = require('../model/jobmodel')
const JobApplication= require('../model/jobapplicationModel');
const multer = require("multer");
const path = require('path');
exports.home = async (req, res) => {
  try {
    const User = await user.findById(req.session.userID);
    if (!User) {
      return res.render("index", { User: null });
    }
    res.render("index", { User });
  } catch (error) {
    // res.render('index', { user: User })
    res.status(500).send("Error loading home page: " + error.message);
  }
};

exports.loginpage = (req, res) => {
  res.render("login", { User: null });
};


exports.userprofile = async (req, res) => {
  if (!req.session.userID) {
    return res.redirect("/loginpage");
  }
  try {
    const User = await user.findById(req.session.userID);
    if (!User) {
      return res.redirect("/loginpage");
    }
    res.render("index", { User });
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    res.redirect("/loginpage");
  });
};



// job items


exports.jobs = async (req, res) => {
  try {
    const User = await user.findById(req.session.userID);
    if (!User) {
      return res.redirect("/loginpage");
    } 
    // Fetch jobs after confirming the user exists
    const jobs = await Job.find();   
    // Render the job page with both user and jobs data
    res.render("job", { User, jobs  });
  } catch (error) {
    console.error('Error loading jobs:', error);
    res.status(500).send("Error loading jobs page: " + error.message);
  }
};

exports.createJob = (req, res) => {
  const jobData = {
    category: req.body.job_category,
    designation: req.body.job_designation,
    location: req.body.job_location,
    companyName: req.body.company_name,
    salary: req.body.salary,
    openings: req.body.number_of_openings,
    skills: req.body.skills_required,
    applyBy: req.body.apply_by,
    created_by: req.session.userID,
  };
  
  const job = new Job(jobData);
  
  job.save()
  .then(() => {
    res.redirect('/job');
  })
  .catch((err) => {
    console.error('Error saving job:', err);
    res.status(500).send('Failed to save job to database.');
  });
};
exports.showJobForm=async (req,res)=>{
  try {
        const User = await user.findById(req.session.userID);
        if (!User) {
          return res.redirect("/loginpage");
        }
        res.render('postnewjob',{ User})
      } catch (error) {
        res.status(500).send("Error loading home page: " + error.message);
      }
}


// Show job details
exports.showJobDetails = async (req, res) => {
  try {
    // Fetch the user by session ID
    const User = await user.findById(req.session.userID);
    
    if (!User) {
      // Redirect to login page if the user is not found
      return res.redirect("/loginpage");
    }

    // Fetch the job details by job ID
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      // Handle case if the job is not found
      return res.status(404).send('Job not found.');
    }

    // Render job details page with user and job data
    res.render('jobDetails', { User, job });

  } catch (err) {
    // Log the error and send a response
    console.error('Error retrieving job details:', err);
    res.status(500).send('Failed to retrieve job details.');
  }
};


exports.editJobForm = async (req, res) => {
  try {
    const User = await user.findById(req.session.userID);
    if (!User) {
      // Redirect to login page if the user is not found
      return res.redirect("/loginpage");
    }
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).send('Job not found');
    }
  
    res.render('editJob', {User, job });
  } catch (err) {
    console.error('Error retrieving job for editing:', err);
    res.status(500).send('Failed to retrieve job for editing.');
  }
};

exports.updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.session.userID; // Get the current user's ID from the session

    // Find the job by ID
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).send('Job not found');
    }

    // Check if the current user is the one who created the job
    if (job.created_by.toString() !== userId) {
      return res.status(403).send('You are not authorized to update this job');
    }

    // Update job details
    const updatedData = {
      category: req.body.job_category,
      designation: req.body.job_designation,
      location: req.body.job_location,
      companyName: req.body.company_name,
      salary: req.body.salary,
      openings: req.body.number_of_openings,
      skills: req.body.skills_required,
      applyBy: req.body.apply_by,
    };

    const updatedJob = await Job.findByIdAndUpdate(jobId, updatedData, { new: true });
    if (!updatedJob) {
      return res.status(404).send('Job not found');
    }

    res.redirect(`/job/${jobId}`);
  } catch (err) {
    console.error('Error updating job:', err);
    res.status(500).send('Failed to update job.');
  }
};


exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.session.userID; // Get the current user's ID from the session

    // Find the job by ID
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).send('Job not found');
    }

    // Check if the current user is the one who created the job
    if (job.created_by.toString() !== userId) {
      return res.status(403).send('You are not authorized to delete this job');
    }

    // Delete the job if the user is authorized
    await Job.findByIdAndDelete(jobId);
    
    res.redirect('/job');
  } catch (err) {
    console.error('Error deleting job:', err);
    res.status(500).send('Failed to delete job.');
  }
};




// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/resumes'); // Save files to 'uploads/resumes' directory
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

exports.applyForJob = async (req, res) => {
    try {
        upload.single('resume')(req, res, async (err) => {
            if (err) {
                return res.status(500).send('Error uploading file: ' + err.message);
            }
             // Ensure file upload succeeded
             if (!req.file) {
              return res.status(400).send('No file uploaded.');
          }

            const { name, email, contact, jobId } = req.body; // Assuming you pass jobId in the form
            const resumePath = req.file.path;

            // Save the job application to the database
            const jobApplication = new JobApplication({
                user: req.session.userID, // User ID from session
                job: jobId, // Job ID from the form
                resume: resumePath,
                name,
                email,
                contact,
            });

            await jobApplication.save();

            // Send confirmation email as before
            let transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            let mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Job Application Confirmation',
                text: `Dear ${name},\n\nThank you for applying for the job. We have received your application and your resume. We will get back to you shortly.\n\nBest regards,\nYour Company Name`,
                attachments: [
                    {
                        filename: req.file.originalname,
                        path: resumePath,
                    }
                ]
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).send('Error sending email: ' + error.message);
                }
                // res.status(200).send('Application submitted successfully! An email confirmation has been sent.');
                res.redirect('applications')
            });
        });
    } catch (error) {
        res.status(500).send('Server error: ' + error.message);
    }
};

exports.viewApplications = async (req, res) => {
  try {const User = await user.findById(req.session.userID);
      const applications = await JobApplication.find().populate('job').populate('user');
      res.render('applications', { applications ,User});
  } catch (error) {
      res.status(500).send('Error fetching applications: ' + error.message);
  }
};



