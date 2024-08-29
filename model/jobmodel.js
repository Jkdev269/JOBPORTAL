const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  category: String,
  designation: String,
  location: String,
  companyName: String,
  salary: String,
  openings: Number,
  skills: [String],
  applyBy: Date,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
