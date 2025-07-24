# UdemyWatcher

**UdemyWatcher** is an automated backend service developed in Node.js/TypeScript that continuously monitors the Udemy platform to detect free or highly discounted courses (≥10% off) based on customizable keywords. With a robust architecture integrating Playwright for automated data extraction, MongoDB for historical storage, and a multi-channel notification system (email/WhatsApp), this solution ensures users never miss the best learning opportunities. The system offers a complete REST API with Swagger documentation, scheduled tasks every 5 hours, and intelligent filtering that analyzes course content to perfectly match defined search criteria.

## Features

- **Automated Udemy scraping** every 5 hours
- **Keyword management** via REST API
- **MongoDB storage** for course history
- **Email and WhatsApp notifications**
- **Full REST API** with Swagger documentation
- **Security** and rate limiting
- **Statistics** and monitoring

## Installation

```bash
# Clone the repository
git clone https://github.com/Charlot-DEDJINOU/UdemyWatcher
cd UdemyWatcher

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your configurations

# Build the project
npm run build

# Start in development mode
npm run dev

# Or start in production
npm start
```

## Configuration

### Environment Variables

Configure the `.env` file with your settings:

- **MongoDB**: `MONGODB_URI`
- **Email**: SMTP settings for Nodemailer
- **WhatsApp**: Twilio credentials
- **API**: port and CORS

### System Dependencies Installation

```bash
# Install Playwright (required for scraping)
npx playwright install chromium
```

## API Documentation

Once the server is running, the interactive documentation is available at:
`http://localhost:3000/docs`

### Main Endpoints

#### Keywords
- `GET /api/keywords` - List keywords
- `POST /api/keywords` - Add a keyword
- `DELETE /api/keywords/:id` - Delete a keyword
- `PATCH /api/keywords/:id/toggle` - Enable/disable

#### Courses
- `GET /api/courses` - List courses (with pagination and filters)
- `GET /api/courses/stats` - Statistics

#### Scraper
- `POST /api/scraper/trigger` - Trigger manual scraping
- `GET /api/scraper/status` - Service status

## Architecture

```
src/
├── config/          # Configuration (DB, Swagger)
├── models/          # MongoDB models (Course, Keyword)
├── services/        # Services (Scraper, Notifications, Scheduler)
├── routes/          # Express API routes
├── middleware/      # Middlewares (Auth, Rate limiting, Errors)
├── types/           # TypeScript types
└── index.ts         # Entry point
```

## Scraping Workflow

1. **Scheduling**: Cron job every 5 hours
2. **Retrieval**: Read active keywords from the database
3. **Scraping**: Search Udemy with Playwright for each keyword
4. **Filtering**: Free courses or those with ≥10% discount
5. **Saving**: Store new courses in the database
6. **Notifications**: Send email/WhatsApp alerts

## Notifications

### Email
Configured via Nodemailer (Gmail, Outlook, custom SMTP)

### WhatsApp
Twilio Programmable Messaging integration

Notifications are sent only for **new** detected courses.

## Security

- Rate limiting (100 req/15min per IP)
- Helmet.js for security headers
- Input validation
- Proper error handling
- Configurable CORS

## Tests

```bash
# Run tests
npm test

# Tests with coverage
npm run test:coverage
```

### Production Environment Variables

```bash
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/udemy-watcher
API_URL=http://localhost:3000
CORS_ORIGIN=*
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="UdemyWatcher <noreply@udemywatcher.com>"
EMAIL_RECIPIENTS=user1@example.com,user2@example.com
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=+14155238886
WHATSAPP_RECIPIENTS=+33612345678,+33687654321
```

## Monitoring

- Health check: `GET /health`
- Structured logs with timestamps
- Performance metrics
- Centralized error management

## Contribution

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For any questions or issues:
- Email: dedjinoucharlotjoel@gmail.com
- Issues: GitHub Issues
- Docs: `/docs` endpoint

## Author

["Charlot DEDJINOU"](https://charlot-dedjinou.vercel.app)