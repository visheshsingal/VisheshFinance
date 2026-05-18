import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String }
});

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
