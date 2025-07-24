import { Router, Request, Response } from 'express';
import { Course } from '../models/Course';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         instructor:
 *           type: string
 *         originalPrice:
 *           type: number
 *         currentPrice:
 *           type: number
 *         discountPercentage:
 *           type: number
 *         url:
 *           type: string
 *         imageUrl:
 *           type: string
 *         rating:
 *           type: number
 *         studentsCount:
 *           type: number
 *         keyword:
 *           type: string
 *         isFree:
 *           type: boolean
 *         scrapedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Récupère tous les cours avec pagination et filtres
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Filtrer par mot-clé
 *       - in: query
 *         name: free
 *         schema:
 *           type: boolean
 *         description: Filtrer les cours gratuits
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, discount, price]
 *           default: newest
 *     responses:
 *       200:
 *         description: Liste des cours avec pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      keyword,
      free,
      page = 1,
      limit = 20,
      sort = 'newest'
    } = req.query;

    // Construction des filtres
    const filter: any = {};
    
    if (keyword) {
      filter.keyword = new RegExp(keyword as string, 'i');
    }
    
    if (free !== undefined) {
      filter.isFree = free === 'true';
    }

    // Configuration du tri
    let sortConfig: any = {};
    switch (sort) {
      case 'oldest':
        sortConfig = { scrapedAt: 1 };
        break;
      case 'discount':
        sortConfig = { discountPercentage: -1, scrapedAt: -1 };
        break;
      case 'price':
        sortConfig = { currentPrice: 1, scrapedAt: -1 };
        break;
      default: // newest
        sortConfig = { scrapedAt: -1 };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Requêtes
    const [courses, total] = await Promise.all([
      Course.find(filter)
        .sort(sortConfig)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Course.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      courses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des cours' });
  }
});

/**
 * @swagger
 * /api/courses/stats:
 *   get:
 *     summary: Statistiques des cours
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Statistiques générales
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [totalCourses, freeCourses, discountedCourses, keywordStats] = await Promise.all([
      Course.countDocuments(),
      Course.countDocuments({ isFree: true }),
      Course.countDocuments({ isFree: false, discountPercentage: { $gte: 10 } }),
      Course.aggregate([
        {
          $group: {
            _id: '$keyword',
            count: { $sum: 1 },
            freeCount: { $sum: { $cond: ['$isFree', 1, 0] } },
            avgDiscount: { $avg: '$discountPercentage' }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      totalCourses,
      freeCourses,
      discountedCourses,
      keywordStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

export default router;