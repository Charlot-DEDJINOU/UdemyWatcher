export interface ICourse {
  _id?: string;
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

export interface IKeyword {
  _id?: string;
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