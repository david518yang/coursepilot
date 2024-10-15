// Importing mongoose library along with Document and Model types from it
import mongoose, { Document, Model } from 'mongoose';
import { INoteLean } from './Note';

export interface ICourse {
  title: string;
  emoji: string;
}

export interface ICourseWithNotes extends ICourse {
  _id: string;
  notes: INoteLean[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseDocument extends ICourse, Document {
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new mongoose.Schema<ICourseDocument>(
  {
    title: {
      type: String,
      required: true
    },
    emoji: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Course: Model<ICourseDocument> =
  mongoose.models?.Courses || mongoose.model('Courses', courseSchema);

export default Course;

