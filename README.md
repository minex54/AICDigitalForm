# Alliance Insurance - DigitalForms Portal

A modern web portal for Alliance Insurance Company, allowing customers to submit various insurance forms online. The system includes a secure staff admin dashboard for reviewing submissions, exporting data to CSV, and generating professional PDF reports with digital signatures.

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [SQLite3](https://www.sqlite.org/index.html) (usually pre-installed or handled by Node driver)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd DigitalForms
   ```

2. Install dependencies for the backend:
   ```bash
   cd backend
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   The portal will be available at: `http://localhost:3001`
   The Admin Dashboard: `http://localhost:3001/admin`

## 🛠 Features

- **8 Digital Forms**: Comprehensive forms for Motor Claims, Travel, Domestic Proposals, KYC, and more.
- **Modern Security**: Interactive Slider CAPTCHA to prevent bot submissions.
- **Staff Admin Dashboard**:
  - Real-time submission statistics.
  - Advanced filtering and search.
  - Status management (Pending, Reviewed, Approved, Rejected).
  - Bulk Export to CSV for Excel analysis.
  - Individual Export to branded PDF with signatures.
- **Database-backed Authentication**: Manage staff credentials securely in SQLite.

## 🐳 Containerization (Docker)

You can containerize the entire system using the provided Docker configuration.

### Build the Image
```bash
docker build -t digital-forms .
```

### Run the Container
```bash
docker run -p 3001:3001 -v $(pwd)/backend/digitalforms.db:/usr/src/app/backend/digitalforms.db digital-forms
```
> [!TIP]
> Use a volume for the `.db` file (as shown above) to ensure your data persists even if the container is restarted or recreated.

## 🌐 Deployment Options

### 1. Simple VPS (DigitalOcean, Linode, AWS EC2)
- Deploy the code to a Linux server.
- Install Node.js and Use `pm2` to keep the process alive.
- Use Nginx as a reverse proxy to handle SSL (HTTPS) and port 80/443 mapping.

### 2. PaaS (Heroku, Render, Railway)
- These platforms can detect the `package.json` in the `backend/` folder.
- You may need to set the root directory or use a Procfile.
- **Note**: SQLite files are wiped on redeploy on Heroku. Use a managed database (PostgreSQL/MySQL) if deploying to Heroku, or use a platform with persistent disks like Railway or Render.

### 3. Managed Containers (AWS ECS, Google Cloud Run)
- Push the Docker image to a registry (Docker Hub, ECR, GCR).
- Deploy using the cloud provider's container management service.

## 📁 Project Structure
```text
DigitalForms/
├── index.html              # Customer Landing Page
├── Motor_Claim_Form.html   # (And other forms...)
├── logo.jpg                # Branding Asset
└── backend/
    ├── server.js           # Express Server
    ├── database.js         # SQLite Integration
    ├── digitalforms.db     # Local Database File
    ├── routes/             # API Endpoints
    └── admin/              # Admin Dashboard Frontend
```

---
© 2026 Alliance Insurance Company. All rights reserved.
