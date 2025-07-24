import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UdemyWatcher API',
      version: '1.0.0',
      description: 'API pour surveiller les cours Udemy gratuits et en promotion',
      contact: {
        name: 'UdemyWatcher',
        email: 'support@udemywatcher.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Serveur de développement'
      }
    ],
    tags: [
      {
        name: 'Keywords',
        description: 'Gestion des mots-clés de recherche'
      },
      {
        name: 'Courses',
        description: 'Consultation des cours trouvés'
      },
      {
        name: 'Scraper',
        description: 'Contrôle du service de scraping'
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);