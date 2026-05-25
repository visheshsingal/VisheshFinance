import mongoose from 'mongoose';

const WithdrawalSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  purpose: { type: String, required: true },
  givenBy: { type: String, required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String }
});

export default mongoose.models.Withdrawal || mongoose.model('Withdrawal', WithdrawalSchema);
