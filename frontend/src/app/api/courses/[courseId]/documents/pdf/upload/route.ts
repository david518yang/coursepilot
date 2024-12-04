import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import PDF from '@/lib/models/PDF';

function removePdfExtension(filename: string): string {
  return filename.endsWith('.pdf') ? filename.slice(0, -4) : filename;
}

export async function POST(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file || !params.courseId) {
      return NextResponse.json({ error: 'File and courseId are required' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const sanitizedFilename = removePdfExtension(file.name);

    // Create new PDF document
    const newPDF = new PDF({
      filename: sanitizedFilename,
      filesize: file.size,
      content: buffer,
      courseId: params.courseId,
      userId: user.id,
    });

    await newPDF.save();

    // Return success without the content buffer
    return NextResponse.json({
      _id: newPDF._id.toString(),
      title: newPDF.filename,
      type: 'pdf',
      url: `/courses/${params.courseId}/pdfs/${newPDF._id}`,
      updatedAt: newPDF.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 });
  }
}
