import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import PDF, { IPDFDocument } from '@/lib/models/PDF';

// Get a single PDF
export async function GET(request: NextRequest, { params }: { params: { pdfId: string; courseId: string } }) {
  try {
    const pdfId = params.pdfId;
    const courseId = params.courseId;

    const user = await currentUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    if (!pdfId) {
      return NextResponse.json({ error: 'PDF ID is required' }, { status: 400 });
    }

    const pdf = await PDF.findOne({
      _id: pdfId,
      courseId,
      userId,
    });

    if (!pdf) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    // Convert buffer to base64 for frontend display
    const base64Pdf = pdf.content.toString('base64');

    return NextResponse.json({
      success: true,
      pdf: {
        _id: pdf._id,
        filename: pdf.filename,
        filesize: pdf.filesize,
        content: base64Pdf,
        courseId: pdf.courseId,
        createdAt: pdf.createdAt,
        updatedAt: pdf.updatedAt,
      },
    });
  } catch (error) {
    console.error('PDF retrieval error:', error);
    return NextResponse.json({ error: 'Failed to retrieve PDF' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { courseId: string; pdfId: string } }) {
  const deletePDFFromCourse = async (courseId: string, pdfId: string, userId: string): Promise<IPDFDocument | null> => {
    const note = await PDF.findOneAndDelete({ _id: pdfId, courseId, userId });

    return note;
  };

  const user = await currentUser();

  if (!user || !user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const note = await deletePDFFromCourse(params.courseId, params.pdfId, user.id);

  if (!note) {
    return Response.json({ error: 'PDF set not found or unauthorized' }, { status: 404 });
  }

  return Response.json({ message: 'PDF deleted successfully' }, { status: 200 });
}
