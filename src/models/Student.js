import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  parentName: { type: String },
  contact: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  classId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
