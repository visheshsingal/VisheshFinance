import connectDB from '@/lib/db';
import Fee from '@/models/Fee';
import '@/models/Student'; // Ensure Student model is loaded for populate

export async function GET(req) {
  try {
    await connectDB();
    const fees = await Fee.find().populate({
      path: 'student',
      populate: { path: 'course' }
    }).sort({ date: -1 });
    return Response.json(fees);
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const fee = new Fee(body);
    await fee.save();
    const populated = await Fee.findById(fee._id).populate({
      path: 'student',
      populate: { path: 'course' }
    });
    return Response.json(populated, { status: 201 });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}
