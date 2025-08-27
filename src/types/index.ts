import { Document, Types } from "mongoose";

export interface ICourse extends Document {
  _id: Types.ObjectId;
  title: string;
  instructor: string;
  originalPrice: number;
  currentPrice: number;
  discountPercentage: number;
  url: string;
  imageUrl?: string;
  description?: string;
  rating?: number;
  studentsCount?: number;
  keyword: string;
  scrapedAt: Date;
  isFree: boolean;
}

export interface IKeyword extends Document{
  _id: Types.ObjectId;
  keyword: string;
  isActive: boolean;
  createdAt: Date;
  lastScrapedAt?: Date;
}

export interface NotificationConfig {
  email?: {
    enabled: boolean;
    recipients: string[];
  };
  whatsapp?: {
    enabled: boolean;
    recipients: string[];
  };
}