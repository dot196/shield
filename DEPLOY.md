# Deploying Dlinqnt Shield

This guide will help you deploy Dlinqnt Shield to Heroku using GitHub integration.

## Prerequisites

1. [GitHub Account](https://github.com)
2. [Heroku Account](https://heroku.com)
3. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed

## GitHub Setup

1. Create a new repository on GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/username/dlinqnt-shield.git
   git push -u origin main
   ```

## Heroku Deployment

1. Log in to Heroku:
   ```bash
   heroku login
   ```

2. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```

3. Connect GitHub repository to Heroku:
   - Go to your Heroku dashboard
   - Select your app
   - Go to Deploy tab
   - Choose GitHub as deployment method
   - Connect to your GitHub repository

4. Add PostgreSQL addon:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

5. Configure environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   ```

6. Enable automatic deploys from GitHub:
   - In Heroku dashboard, go to Deploy tab
   - Under "Automatic deploys", choose your main branch
   - Click "Enable Automatic Deploys"

7. Deploy:
   - Either push to GitHub (if automatic deploys enabled):
     ```bash
     git push origin main
     ```
   - Or manually deploy via Heroku:
     ```bash
     git push heroku main
     ```

## Verifying Deployment

1. Open your app:
   ```bash
   heroku open
   ```

2. Check logs if needed:
   ```bash
   heroku logs --tail
   ```

## Troubleshooting

If you encounter any issues:

1. Check Heroku logs:
   ```bash
   heroku logs --tail
   ```

2. Verify database connection:
   ```bash
   heroku pg:info
   ```

3. Ensure all environment variables are set:
   ```bash
   heroku config
   ```
