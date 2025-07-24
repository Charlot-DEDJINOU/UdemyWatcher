import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { ICourse } from '../types';

export class NotificationService {
  private emailTransporter: nodemailer.Transporter | null = null;
  private twilioClient: any = null;

  constructor() {
    this.initializeEmail();
    this.initializeWhatsApp();
  }

  private initializeEmail(): void {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      console.log('✅ Service email initialisé');
    }
  }

  private initializeWhatsApp(): void {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      console.log('✅ Service WhatsApp initialisé');
    }
  }

  async sendEmailNotification(courses: ICourse[]): Promise<void> {
    if (!this.emailTransporter || courses.length === 0) return;

    const recipients = process.env.EMAIL_RECIPIENTS?.split(',') || [];
    if (recipients.length === 0) return;

    const htmlContent = this.generateEmailHTML(courses);

    try {
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: recipients,
        subject: `🎓 ${courses.length} nouveaux cours Udemy trouvés !`,
        html: htmlContent
      });
      
      console.log(`📧 Email envoyé à ${recipients.length} destinataires`);
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
    }
  }

  async sendWhatsAppNotification(courses: ICourse[]): Promise<void> {
    if (!this.twilioClient || courses.length === 0) return;

    const recipients = process.env.WHATSAPP_RECIPIENTS?.split(',') || [];
    if (recipients.length === 0) return;

    for (const course of courses.slice(0, 5)) { // Limiter à 5 cours
      const message = this.generateWhatsAppMessage(course);

      for (const recipient of recipients) {
        try {
          await this.twilioClient.messages.create({
            body: message,
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
            to: `whatsapp:${recipient}`
          });
        } catch (error) {
          console.error(`❌ Erreur WhatsApp pour ${recipient}:`, error);
        }
      }
    }

    console.log(`📱 Messages WhatsApp envoyés à ${recipients.length} destinataires`);
  }

  private generateEmailHTML(courses: ICourse[]): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
          .header { text-align: center; color: #a435f0; margin-bottom: 30px; }
          .course { border: 1px solid #ddd; margin-bottom: 20px; padding: 15px; border-radius: 8px; }
          .course-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; }
          .course-info { color: #666; margin-bottom: 5px; }
          .price { font-weight: bold; color: #a435f0; }
          .free { color: #5cb85c; }
          .discount { color: #f0ad4e; }
          .btn { background: #a435f0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Nouveaux cours Udemy trouvés !</h1>
            <p>${courses.length} cours gratuits ou en promotion</p>
          </div>
          ${courses.map(course => `
            <div class="course">
              <div class="course-title">${course.title}</div>
              <div class="course-info">👨‍🏫 Instructeur: ${course.instructor}</div>
              <div class="course-info">⭐ Note: ${course.rating || 'N/A'} | 👥 Étudiants: ${course.studentsCount || 'N/A'}</div>
              <div class="course-info">🏷️ Mot-clé: ${course.keyword}</div>
              <div class="price ${course.isFree ? 'free' : 'discount'}">
                ${course.isFree ? 
                  '🆓 GRATUIT' : 
                  `💰 ${course.currentPrice}€ (était ${course.originalPrice}€) - ${course.discountPercentage}% de réduction`
                }
              </div>
              <a href="${course.url}" class="btn" target="_blank">Voir le cours</a>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;
  }

  private generateWhatsAppMessage(course: ICourse): string {
    const priceInfo = course.isFree ? 
      '🆓 *GRATUIT*' : 
      `💰 ${course.currentPrice}€ (était ${course.originalPrice}€) - *${course.discountPercentage}% de réduction*`;

    return `🎓 *Nouveau cours Udemy trouvé !*

📚 *${course.title}*
👨‍🏫 Instructeur: ${course.instructor}
🏷️ Mot-clé: ${course.keyword}
${priceInfo}

🔗 ${course.url}`;
  }
}