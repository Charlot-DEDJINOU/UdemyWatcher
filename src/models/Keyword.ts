import mongoose, { Schema } from 'mongoose';
import { IKeyword } from '../types';

const keywordSchema = new Schema<IKeyword>({
  keyword: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastScrapedAt: { type: Date }
}, {
  timestamps: true
});

export const Keyword = mongoose.model<IKeyword>('Keyword', keywordSchema);