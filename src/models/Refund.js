import mongoose from 'mongoose';

const RefundSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.models.Refund || mongoose.model('Refund', RefundSchema);
