import mongoose from 'mongoose';
import './Student'; // Ensure Student model is loaded for ref population

const FeeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  totalAmount: { type: Number, required: true, default: 0 },
  paidAmount: { type: Number, required: true, default: 0 },
  amount: { type: Number }, // backwards compatibility
  method: { type: String, enum: ['cash', 'bank', 'upi'], default: 'cash' },
  bankName: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

export default mongoose.models.Fee || mongoose.model('Fee', FeeSchema);
