const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job', // Reference to the Job model (assuming you have a Job model)
        required: true,
    },
    resume: {
        type: String,
        required: true, // Path to the uploaded resume file
    },
    appliedAt: {
        type: Date,
        default: Date.now, // Timestamp of when the application was made
    }
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = JobApplication;
