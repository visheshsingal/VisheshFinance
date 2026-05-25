import connectDB from '@/lib/db';
import Refund from '@/models/Refund';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const refund = await Refund.findByIdAndUpdate(id, body, { new: true })
      .populate({ path: 'student', populate: { path: 'course' } });
    if (!refund) return Response.json({ message: 'Refund record not found' }, { status: 404 });
    return Response.json(refund);
  } catch (err) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const refund = await Refund.findByIdAndDelete(id);
    if (!refund) return Response.json({ message: 'Refund record not found' }, { status: 404 });
    return Response.json({ message: 'Refund record deleted successfully' });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}
