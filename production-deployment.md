# Production Deployment Guide

## Overview

For deployment to a production server, you won't use http-server, but rather a proper web server or hosting solution.

## Option 1: Traditional Web Server

### Using Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Serve the frontend directly
    root /path/to/rswport2.0/Frontend;
    index index.html;

    # API proxy for backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Fallback to index.html for SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Using Apache

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /path/to/rswport2.0/Frontend

    <Directory "/path/to/rswport2.0/Frontend">
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>

    ProxyPass /api http://localhost:3001/api
    ProxyPassReverse /api http://localhost:3001/api
</VirtualHost>
```

## Option 2: Node.js Server Deployment

For Express.js deployment:

1. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name "rswport"
pm2 save
pm2 startup
```

2. Configure your server.js to serve static files:
```javascript
app.use(express.static('Frontend'));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend/index.html'));
});
```

## Option 3: Cloud Deployment

### Vercel/Netlify/GitHub Pages for Frontend

For static frontend hosting:
- Configure build settings to output to the Frontend directory
- Deploy using the platform's CLI or GitHub integration

### Railway/Heroku/Render for Backend

For the API server:
- Add a Procfile (for Heroku): `web: node server.js`
- Configure environment variables for your database connections, API keys, etc.

## Environment Variables

In production, make sure to use environment variables for sensitive configuration:

```javascript
// Config example for production
const config = {
  apiBaseUrl: process.env.API_URL || 'https://api.yourdomain.com',
  // ...other config
};
```

## Domain Configuration

1. Point your domain to your hosting provider
2. Configure SSL certificates (Let's Encrypt is free)
3. Set up proper CORS headers if frontend and backend are on different domains
