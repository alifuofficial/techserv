# Deployment Guide for CapRover (milkytech.online)

This project is now ready for deployment to CapRover with automatic GitHub push updates.

## Step 1: Create the App in CapRover
1. Log in to your CapRover dashboard.
2. Go to **Apps** and create a new app named `techserv`.

## Step 2: Configure Persistent Storage (CRITICAL)
Since the app uses SQLite, you must map a persistent volume to avoid data loss.
1. Go to the **techserv** app settings in CapRover.
2. Click on **App Config**.
3. Scroll down to **Persistent Directories**.
4. Click **Add Node Path**.
   - **Path in App**: `/app/db`
   - **Label**: `techserv-db-data` (or any name you like)
5. Click **Save & Restart**.

## Step 3: Set Environment Variables
In the **App Config** section, add the following Environment Variables:
- `DATABASE_URL`: `file:/app/db/custom.db`
- `NEXTAUTH_URL`: `https://milkytech.online`
- `NEXTAUTH_SECRET`: *[Generate a random string, e.g., `openssl rand -base64 32`]*
- `PORT`: `3000`

## Step 4: Hook up GitHub
1. Go to the **Deployment** tab in the techserv app.
2. Follow the instructions for **Method 3: GitHub/Bitbucket/Gitlab Webhook**.
3. Enter your repository URL (e.g., `https://github.com/your-username/techserv`).
4. Enter the branch name (e.g., `main`).
5. Copy the **Finish Setup** Webhook URL provided by CapRover.
6. Go to your GitHub Repository -> **Settings** -> **Webhooks**.
7. Click **Add webhook**.
   - **Payload URL**: Use the URL you copied from CapRover.
   - **Content type**: `application/json`
8. Click **Add webhook**.

## Step 5: Verification
- After push, check the **Deployment** tab in CapRover to monitor the build logs.
- Once finished, visit **https://milkytech.online**.
- The database will automatically be initialized/migrated on startup thanks to the `prisma db push` command in the `Dockerfile`.
