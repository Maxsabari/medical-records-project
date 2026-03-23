# Deployment Guide: Securing Medical Records

This project is now a fully functional Node.js application with an Express backend and an SQLite database!

To run this on your local machine:
1. Open a terminal in this folder.
2. Run `npm install` (if not done already).
3. Run `npm start`.
4. Open your browser and go to `http://localhost:8080`.

## Deploying to the Cloud (Render)

For a final year project, **Render** (render.com) is the easiest and free way to deploy a Node.js web application.

1. **Push your code to GitHub:**
   - Create a new repository on GitHub.
   - Run the following commands in this directory:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
     git push -u origin main
     ```

2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com).
   - Click **New** -> **Web Service**.
   - Connect your GitHub account and select your newly created repository.

3. **Configure the Web Service:**
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Deploy:**
   - Click **Create Web Service**.
   - Render will build your application and after a few minutes provide you with a live URL (e.g., `https://medcrypto.onrender.com`).

*Note: The free tier of Render uses an ephemeral disk, meaning the `database.db` file might reset between deployments or after prolonged inactivity. This is perfectly fine for a prototype or final year presentation as you can just quickly register and insert new mock data.*

If you require persistent storage permanently, you can upgrade Render to add a 'Disk' or migrate the SQLite logic to a free MongoDB Atlas cloud cluster.
