import connectDB from '@/lib/db';
import Student from '@/models/Student';
import Course from '@/models/Course'; // Ensure Course model is registered

export async function GET(req) {
  try {
    await connectDB();
    const students = await Student.find().populate('course').sort({ createdAt: -1 });
    return Response.json(students);
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const student = new Student(body);
    await student.save();
    return Response.json(student, { status: 201 });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}
