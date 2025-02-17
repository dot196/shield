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