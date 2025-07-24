import { chromium, Browser, Page } from 'playwright';
import { ICourse } from '../types';

export class UdemyScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Configuration du navigateur
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async scrapeCourses(keyword: string): Promise<ICourse[]> {
    if (!this.page) throw new Error('Scraper non initialisé');

    const courses: ICourse[] = [];
    const searchUrl = `https://www.udemy.com/courses/search/?q=${encodeURIComponent(keyword)}&src=ukw`;

    try {
      console.log(`🔍 Recherche pour: ${keyword}`);
      await this.page.goto(searchUrl, { waitUntil: 'networkidle' });
      
      // Attendre le chargement des cours
      await this.page.waitForSelector('[data-purpose="course-card-container"]', { timeout: 10000 });

      // Extraire les données des cours
      const courseElements = await this.page.$$('[data-purpose="course-card-container"]');
      
      for (const element of courseElements.slice(0, 20)) { // Limiter à 20 cours
        try {
          const courseData = await this.extractCourseData(element, keyword);
          if (courseData && this.isValidCourse(courseData)) {
            courses.push(courseData);
          }
        } catch (error) {
          console.warn('Erreur extraction cours:', error);
        }
      }

      console.log(`✅ ${courses.length} cours trouvés pour "${keyword}"`);
      return courses;

    } catch (error) {
      console.error(`❌ Erreur scraping pour "${keyword}":`, error);
      return [];
    }
  }

  private async extractCourseData(element: any, keyword: string): Promise<ICourse | null> {
    try {
      // Titre
      const titleElement = await element.$('[data-purpose="course-title-url"]');
      const title = await titleElement?.textContent() || '';
      const url = await titleElement?.getAttribute('href') || '';

      // Instructeur
      const instructorElement = await element.$('[data-purpose="safely-set-inner-html:instructor-list:instructor"]');
      const instructor = await instructorElement?.textContent() || '';

      // Prix
      const priceContainer = await element.$('[data-purpose="course-price"]');
      let currentPrice = 0;
      let originalPrice = 0;
      let discountPercentage = 0;

      if (priceContainer) {
        const currentPriceText = await priceContainer.$eval('.price-text--current--black', el => el.textContent).catch(() => null);
        const originalPriceText = await priceContainer.$eval('.price-text--original', el => el.textContent).catch(() => null);

        if (currentPriceText) {
          if (currentPriceText.toLowerCase().includes('free') || currentPriceText.includes('€0')) {
            currentPrice = 0;
          } else {
            currentPrice = parseFloat(currentPriceText.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
          }
        }

        if (originalPriceText) {
          originalPrice = parseFloat(originalPriceText.replace(/[^0-9.,]/g, '').replace(',', '.')) || currentPrice;
        } else {
          originalPrice = currentPrice;
        }

        if (originalPrice > 0 && currentPrice < originalPrice) {
          discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        }
      }

      // Image
      const imageElement = await element.$('img');
      const imageUrl = await imageElement?.getAttribute('src') || '';

      // Rating et étudiants
      const ratingElement = await element.$('[data-purpose="rating"]');
      const rating = ratingElement ? parseFloat(await ratingElement.textContent() || '0') : 0;

      const studentsElement = await element.$('[data-purpose="enrollment"]');
      const studentsText = await studentsElement?.textContent() || '0';
      const studentsCount = parseInt(studentsText.replace(/[^0-9]/g, '')) || 0;

      return {
        title: title.trim(),
        instructor: instructor.trim(),
        originalPrice,
        currentPrice,
        discountPercentage,
        url: url.startsWith('http') ? url : `https://www.udemy.com${url}`,
        imageUrl,
        rating,
        studentsCount,
        keyword,
        scrapedAt: new Date(),
        isFree: currentPrice === 0
      };

    } catch (error) {
      console.warn('Erreur extraction données cours:', error);
      return null;
    }
  }

  private isValidCourse(course: ICourse): boolean {
    // Filtrer selon les critères
    const isFreeOrDiscounted = course.isFree || course.discountPercentage >= 10;
    const hasKeywordInTitle = course.title.toLowerCase().includes(course.keyword.toLowerCase());
    
    return isFreeOrDiscounted && hasKeywordInTitle && course.title.length > 0;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}