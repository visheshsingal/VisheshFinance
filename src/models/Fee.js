import mongoose from 'mongoose';
import './Student'; // Ensure Student model is loaded for ref population

const FeeSchema = new mongoose.Schema({
  receiptType: { type: String, enum: ['student', 'other'], default: 'student' },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: function() { return this.receiptType !== 'other'; }
  },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  amount: { type: Number }, // backwards compatibility
  method: { type: String, enum: ['cash', 'bank', 'upi'], default: 'cash' },
  bankName: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

export default mongoose.models.Fee || mongoose.model('Fee', FeeSchema);
