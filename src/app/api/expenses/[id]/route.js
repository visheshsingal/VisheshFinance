import connectDB from '@/lib/db';
import Expense from '@/models/Expense';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const expense = await Expense.findByIdAndUpdate(id, body, { new: true });
    if (!expense) return Response.json({ message: 'Expense record not found' }, { status: 404 });
    return Response.json(expense);
  } catch (err) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) return Response.json({ message: 'Expense record not found' }, { status: 404 });
    return Response.json({ message: 'Expense record deleted successfully' });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}
