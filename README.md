# Dlinqnt Shield - Advanced Binary Protection

A secure, trademark-protected file obfuscation platform offering advanced digital rights management and secure multi-file processing capabilities.

## Features

- React frontend with TypeScript
- Dynamic file obfuscation engine
- PostgreSQL database integration
- Secure binary file processing
- Red Shield™ trademark protection

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL database
- Git

## Local Development

1. Clone the repository:
```bash
git clone [your-repo-url]
cd dlinqnt-shield
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development server:
```bash
npm run dev
```

## Deployment

### Heroku Deployment

1. Create a Heroku account and install the Heroku CLI
2. Login to Heroku:
```bash
heroku login
```

3. Create a new Heroku app:
```bash
heroku create your-app-name
```

4. Add PostgreSQL addon:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

5. Configure environment variables:
```bash
heroku config:set NODE_ENV=production
```

6. Deploy:
```bash
git push heroku main
```

### cPanel Deployment

1. Create a Node.js application in cPanel
2. Set up a PostgreSQL database in cPanel
3. Update your repository:
```bash
git remote add cpanel ssh://username@your-domain.com:21098/path/to/repository
```

4. Configure environment variables in cPanel
5. Deploy:
```bash
git push cpanel main
```

## License

See [LICENSE.md](LICENSE.md) for details.

## Privacy Policy

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for details.
