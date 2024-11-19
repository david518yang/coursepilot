// Importing mongoose library along with Document and Model types from it
import mongoose, { Document, Model } from 'mongoose';

export interface IPDF {
  filename: string;
  filesize: number;
  content: Buffer;
  userId: string;
  courseId: mongoose.Schema.Types.ObjectId;
}

export interface IPDFClean extends IPDF {
  _id: string;
  updatedAt: string;
  createdAt: string;
}

export interface IPDFDocument extends IPDF, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const pdfSchema = new mongoose.Schema<IPDFDocument>(
  {
    filename: { type: String, required: true },
    filesize: { type: Number, required: true },
    content: { type: Buffer, required: true },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    userId: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const PDF: Model<IPDFDocument> = mongoose.models?.pdf_files || mongoose.model('pdf_files', pdfSchema);

export default PDF;
