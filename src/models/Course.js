import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "CA FOUNDATION - May 2026"
  courseName: { type: String },           // e.g. "CA FOUNDATION"
  className: { type: String },            // Backwards compatibility, e.g. "CA FOUNDATION"
  year: { type: String },                 // e.g. "2026"
  month: { type: String },                // e.g. "May"
  classId: { type: String },              // Batch Code: e.g. "CA-FOUNDATION-MAY-2026"
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);
