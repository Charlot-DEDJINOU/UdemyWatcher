import cron from 'node-cron';
import { Keyword } from '../models/Keyword';
import { Course } from '../models/Course';
import { UdemyScraper } from './scraper';
import { NotificationService } from './notifications';

export class SchedulerService {
  private scraper: UdemyScraper;
  private notificationService: NotificationService;

  constructor() {
    this.scraper = new UdemyScraper();
    this.notificationService = new NotificationService();
  }

  start(): void {
    // Tâche cron toutes les 5 heures
    cron.schedule('0 */5 * * *', async () => {
      console.log('🚀 Démarrage du scraping automatique...');
      await this.runScrapingTask();
    });

    console.log('⏰ Planificateur démarré - scraping toutes les 5 heures');
  }

  async runScrapingTask(): Promise<void> {
    try {
      await this.scraper.initialize();
      
      const keywords = await Keyword.find({ isActive: true });
      console.log(`📋 ${keywords.length} mots-clés actifs trouvés`);

      const newCourses = [];

      for (const keywordDoc of keywords) {
        const courses = await this.scraper.scrapeCourses(keywordDoc.keyword);
        
        for (const courseData of courses) {
          try {
            // Vérifier si le cours existe déjà
            const existingCourse = await Course.findOne({ url: courseData.url });
            
            if (!existingCourse) {
              const course = new Course(courseData);
              await course.save();
              newCourses.push(courseData);
              console.log(`✅ Nouveau cours ajouté: ${courseData.title}`);
            }
          } catch (error) {
            console.warn('Erreur sauvegarde cours:', error);
          }
        }

        // Mettre à jour la date de dernier scraping
        keywordDoc.lastScrapedAt = new Date();
        await keywordDoc.save();
      }

      await this.scraper.close();

      // Envoyer les notifications
      if (newCourses.length > 0) {
        console.log(`📬 Envoi des notifications pour ${newCourses.length} nouveaux cours`);
        await this.notificationService.sendEmailNotification(newCourses);
        await this.notificationService.sendWhatsAppNotification(newCourses);
      }

      console.log('✅ Tâche de scraping terminée');

    } catch (error) {
      console.error('❌ Erreur dans la tâche de scraping:', error);
      await this.scraper.close();
    }
  }

  // Méthode pour déclencher manuellement le scraping
  async triggerManualScraping(): Promise<{ success: boolean; message: string; newCoursesCount: number }> {
    try {
      const startTime = Date.now();
      await this.runScrapingTask();
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        message: `Scraping manuel terminé en ${Math.round(duration / 1000)}s`,
        newCoursesCount: 0 // TODO: retourner le vrai nombre
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors du scraping: ${error}`,
        newCoursesCount: 0
      };
    }
  }
}