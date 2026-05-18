import connectDB from '@/lib/db';
import Fee from '@/models/Fee';
import '@/models/Student'; // Ensure Student model is loaded for populate

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const fee = await Fee.findByIdAndUpdate(id, body, { new: true }).populate({
      path: 'student',
      populate: { path: 'course' }
    });
    if (!fee) return Response.json({ message: 'Fee record not found' }, { status: 404 });
    return Response.json(fee);
  } catch (err) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const fee = await Fee.findByIdAndDelete(id);
    if (!fee) return Response.json({ message: 'Fee record not found' }, { status: 404 });
    return Response.json({ message: 'Fee record deleted successfully' });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}
