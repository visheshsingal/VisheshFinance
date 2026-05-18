import connectDB from '@/lib/db';
import Expense from '@/models/Expense';

export async function GET(req) {
  try {
    await connectDB();
    const expenses = await Expense.find().sort({ date: -1 });
    return Response.json(expenses);
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const expense = new Expense(body);
    await expense.save();
    return Response.json(expense, { status: 201 });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}
