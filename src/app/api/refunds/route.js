import connectDB from '@/lib/db';
import Refund from '@/models/Refund';

export async function GET() {
  try {
    await connectDB();
    const refunds = await Refund.find()
      .populate({ path: 'student', populate: { path: 'course' } })
      .sort({ date: -1 });
    return Response.json(refunds);
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const refund = new Refund(body);
    await refund.save();
    const populated = await Refund.findById(refund._id)
      .populate({ path: 'student', populate: { path: 'course' } });
    return Response.json(populated, { status: 201 });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}
