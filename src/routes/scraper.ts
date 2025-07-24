import { Router, Request, Response } from 'express';
import { SchedulerService } from '../services/scheduler';

const router = Router();
const schedulerService = new SchedulerService();

/**
 * @swagger
 * /api/scraper/trigger:
 *   post:
 *     summary: Déclenche un scraping manuel
 *     tags: [Scraper]
 *     responses:
 *       200:
 *         description: Scraping déclenché avec succès
 *       500:
 *         description: Erreur lors du scraping
 */
router.post('/trigger', async (req: Request, res: Response) => {
  try {
    const result = await schedulerService.triggerManualScraping();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        newCoursesCount: result.newCoursesCount
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur interne lors du déclenchement du scraping'
    });
  }
});

/**
 * @swagger
 * /api/scraper/status:
 *   get:
 *     summary: Statut du service de scraping
 *     tags: [Scraper]
 *     responses:
 *       200:
 *         description: Statut du service
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    // TODO: Implémenter un vrai système de statut
    res.json({
      status: 'running',
      nextRun: 'Toutes les 5 heures',
      lastRun: null // TODO: stocker la dernière exécution
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du statut' });
  }
});

export default router;