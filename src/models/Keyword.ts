import mongoose, { Document, Schema } from 'mongoose';
import { IKeyword } from '../types';

export interface IKeywordDocument extends IKeyword, Document {}

const keywordSchema = new Schema<IKeywordDocument>({
  keyword: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastScrapedAt: { type: Date }
}, {
  timestamps: true
});

export const Keyword = mongoose.model<IKeywordDocument>('Keyword', keywordSchema);