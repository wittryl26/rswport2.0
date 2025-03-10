# Vercel Deployment Guide for RSW Portfolio

## Overview

This guide explains how to deploy your RSW Portfolio application to Vercel, which can host both your frontend and backend components.

## Prerequisites

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install Vercel CLI (optional but recommended):
   ```bash
   npm install -g vercel
   ```

## Project Structure for Vercel

The project is already structured to work with Vercel:
- `/Frontend` - Contains your static frontend files
- `/api` - Contains serverless function files for your API endpoints
- `vercel.json` - Configuration file for Vercel deployment

## Deployment Steps

### Option 1: Using GitHub Integration (Recommended)

1. Push your project to a GitHub repository
2. Log in to your Vercel dashboard
3. Click "Import Project"
4. Select "Import Git Repository" and choose your repository
5. Configure project:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: Leave empty (configured in vercel.json)
   - Output Directory: Frontend
6. Click "Deploy"

### Option 2: Using Vercel CLI

1. Open terminal in your project root
2. Run:
   ```bash
   vercel login
   vercel
   ```
3. Follow the prompts to deploy your project

## Environment Variables

To set environment variables for your production deployment:

1. In Vercel dashboard, go to your project settings
2. Click on "Environment Variables"
3. Add variables you need:
   - `NODE_ENV` = production
   - Any API keys or configuration settings

## Updating Your Deployment

### With GitHub Integration
Simply push changes to your repository, and Vercel will automatically redeploy.

### With Vercel CLI
Run `vercel` again from your project directory.

## Vercel-specific Features

### Preview Deployments
Each pull request to your GitHub repository will get its own preview URL.

### Custom Domains
1. Go to your project settings in Vercel dashboard
2. Click "Domains"
3. Add your custom domain and follow the verification steps

## Monitoring and Logs

1. In your Vercel dashboard, select your project
2. Go to "Analytics" for performance metrics
3. Check "Logs" for runtime logs and debugging

## Troubleshooting

If your API routes return 404:
- Verify your API files are in the `/api` directory
- Check that your `vercel.json` is correctly configured
- Look at deployment logs for any errors
