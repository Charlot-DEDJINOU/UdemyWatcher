import dotenv from 'dotenv';
import { createApp } from './app';
import { connectDB } from './config/database';
import { SchedulerService } from './services/scheduler';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer(): Promise<void> {
  try {
    await connectDB();

    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`Documentation disponible sur http://localhost:${PORT}/docs`);
      console.log(`Health check sur http://localhost:${PORT}/health`);
    });

    const scheduler = new SchedulerService();
    scheduler.start();

    const gracefulShutdown = (signal: string) => {
      console.log(`\nSignal ${signal} reçu, arrêt en cours...`);
      
      server.close(() => {
        console.log('Serveur HTTP fermé');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('⚠️  Arrêt forcé après timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

process.on('uncaughtException', (error) => {
  console.error('Exception non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promesse rejetée non gérée:', reason);
  process.exit(1);
});

startServer();