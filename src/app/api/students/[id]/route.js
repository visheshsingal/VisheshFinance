import connectDB from '@/lib/db';
import Student from '@/models/Student';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const student = await Student.findByIdAndUpdate(id, body, { new: true });
    if (!student) return Response.json({ message: 'Student not found' }, { status: 404 });
    return Response.json(student);
  } catch (err) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const student = await Student.findByIdAndDelete(id);
    if (!student) return Response.json({ message: 'Student not found' }, { status: 404 });
    return Response.json({ message: 'Student deleted successfully' });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}
