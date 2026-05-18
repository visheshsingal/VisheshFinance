import connectDB from '@/lib/db';
import Course from '@/models/Course';

export async function GET(req) {
  try {
    await connectDB();
    const courses = await Course.find().sort({ createdAt: -1 });
    return Response.json(courses);
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const course = new Course(body);
    await course.save();
    return Response.json(course, { status: 201 });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}
