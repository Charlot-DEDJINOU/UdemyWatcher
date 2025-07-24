import mongoose, { Document, Schema } from 'mongoose';
import { ICourse } from '../types';

export interface ICourseDocument extends ICourse, Document {}

const courseSchema = new Schema<ICourseDocument>({
  title: { type: String, required: true },
  instructor: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  discountPercentage: { type: Number, required: true },
  url: { type: String, required: true, unique: true },
  imageUrl: { type: String },
  description: { type: String },
  rating: { type: Number },
  studentsCount: { type: Number },
  keyword: { type: String, required: true },
  scrapedAt: { type: Date, default: Date.now },
  isFree: { type: Boolean, required: true }
}, {
  timestamps: true
});

courseSchema.index({ keyword: 1, scrapedAt: -1 });
courseSchema.index({ isFree: 1, discountPercentage: -1 });

export const Course = mongoose.model<ICourseDocument>('Course', courseSchema);