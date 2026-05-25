import connectDB from '@/lib/db';
import Withdrawal from '@/models/Withdrawal';

export async function GET(req) {
  try {
    await connectDB();
    const withdrawals = await Withdrawal.find().sort({ date: -1 });
    return Response.json(withdrawals);
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const withdrawal = new Withdrawal(body);
    await withdrawal.save();
    return Response.json(withdrawal, { status: 201 });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}
