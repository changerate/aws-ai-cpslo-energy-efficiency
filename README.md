# AWS AI Energy Efficiency Platform

## 🏆 AWS Cal Poly SLO AI Hackathon Project

This project was developed for the **AWS Cal Poly SLO AI Hackathon**, focusing on creating an intelligent energy management system for educational institutions. Our platform helps schools optimize energy consumption, reduce costs, and improve sustainability through AI-powered building management.

## 🎯 What This Project Does

Our AI-powered energy efficiency platform provides:

- **Real-time Energy Monitoring** - Track energy consumption across campus facilities with live data visualization
- **AI-Powered Optimization** - Machine learning algorithms that automatically optimize HVAC systems and predict maintenance needs
- **Cost Analysis & Savings** - Detailed energy cost tracking with AI-calculated savings projections
- **Smart Building Management** - Automated Air Handling Unit (AHU) optimization for maximum efficiency
- **Interactive Dashboard** - User-friendly interface showing energy usage, costs, and optimization recommendations

The platform combines real-time data processing with predictive analytics to help educational institutions make data-driven decisions about their energy usage.

## 🏗️ How It's Built

### Frontend (Next.js Dashboard)
- **Next.js 15** with React 19 for the web interface
- **TypeScript** for type safety
- **Tailwind CSS v4** for modern styling
- **Recharts** for interactive data visualizations
- **Lucide React** for icons

### Backend (Node.js API)
- **Express.js** with TypeScript for the REST API
- **Security features**: Helmet, CORS, rate limiting
- **JWT authentication** for secure access
- **CSV data processing** for energy data imports
- **Morgan logging** for request monitoring

### AI/ML Components
- **Python scripts** for machine learning algorithms
- **AHU optimization models** for HVAC efficiency
- **Predictive analytics** for energy forecasting and maintenance scheduling

## 🚀 How to Run the Project

### Prerequisites
Make sure you have installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Python** (v3.8 or higher)

### Quick Start

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd aws-ai-cpslo-energy-efficiency
```

2. **Set up the Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings (PORT=3100 is default)
npm run build
```

3. **Set up the Frontend**
```bash
cd ../frontend
npm install
# Frontend will connect to backend at localhost:3100
```

4. **Set up Python Environment** (for AI features)
```bash
cd ..
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Running in Development Mode

**Start the Backend** (Terminal 1):
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:3100`

**Start the Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

**Access the Application**:
Open your browser to `http://localhost:3000`

### Running in Production Mode

**Backend**:
```bash
cd backend
npm run build
npm start
```

**Frontend**:
```bash
cd frontend
npm run build
npm start
```

## 📊 Key Features Demo

Once running, you can explore:
- **Energy Usage Charts** - View real-time and historical consumption data
- **Cost Analysis** - See energy costs and potential savings
- **AHU Optimization** - AI recommendations for HVAC efficiency
- **Maintenance Schedule** - Predictive maintenance alerts

## 🔧 Development Commands

**Backend**:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Check code quality

**Frontend**:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Check code quality

## 📁 Project Structure
```
aws-ai-cpslo-energy-efficiency/
├── frontend/           # Next.js dashboard application
├── backend/            # Express.js API server
├── backend/python/     # Python AI/ML scripts
└── .venv/             # Python virtual environment
```

---

**Developed for the AWS Cal Poly SLO AI Hackathon** 🚀
