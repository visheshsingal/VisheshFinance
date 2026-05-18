import connectDB from '@/lib/db';
import Course from '@/models/Course';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const course = await Course.findByIdAndUpdate(id, body, { new: true });
    if (!course) return Response.json({ message: 'Course not found' }, { status: 404 });
    return Response.json(course);
  } catch (err) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) return Response.json({ message: 'Course not found' }, { status: 404 });
    return Response.json({ message: 'Course deleted successfully' });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}
