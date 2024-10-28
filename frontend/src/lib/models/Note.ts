import mongoose, { Document, Model } from 'mongoose';

export interface INote {
  title: string;
  courseId: mongoose.Schema.Types.ObjectId;
  userId: string;
  content: string;
}

export interface INoteClean {
  _id: string;
  title: string;
  courseId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface INoteLean extends INote {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoteDocument extends INote, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new mongoose.Schema<INoteDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: false,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Note: Model<INoteDocument> = mongoose.models?.Notes || mongoose.model('Notes', noteSchema);

export default Note;
