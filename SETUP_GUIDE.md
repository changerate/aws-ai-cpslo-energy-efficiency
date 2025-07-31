# AWS Energy Efficiency Platform - Setup Guide

## Architecture Overview

This platform consists of a **Node.js/Express backend** and a **Next.js React frontend** designed to track and visualize AWS resource energy consumption and costs.

### Project Structure
```
aws-ai-cpslo-energy-efficiency/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── models/         # Data models
│   │   ├── middleware/     # Express middleware
│   │   └── server.ts       # Main server file
│   └── package.json
├── frontend/               # Next.js React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Next.js pages
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── package.json
└── SETUP_GUIDE.md
```

## Backend Setup (Already Running)

Your backend is already configured and running on port 3100 with the following endpoints:

### Available API Endpoints
- `GET /api/hello` - Test endpoint
- `GET /api/time` - Current time
- `GET /api/energy/usage` - Energy usage data with filtering
- `GET /api/energy/aggregated` - Aggregated data for charts
- `GET /api/energy/metrics` - Efficiency metrics and recommendations
- `GET /api/energy/dashboard` - Dashboard summary data

### Key Features
- **Energy Tracking**: Monitor kWh consumption across AWS resources
- **Cost Analysis**: Track monetary costs by service and region
- **Carbon Footprint**: Calculate CO2 emissions
- **Efficiency Scoring**: AI-powered efficiency recommendations
- **Resource Breakdown**: Analyze usage by EC2, RDS, Lambda, S3, etc.

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the frontend directory:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3100
```

### 3. Start Development Server
```bash
npm run dev
```
The frontend will run on `http://localhost:3000`

## Key Components

### 1. Dashboard Component (`/src/components/dashboard/Dashboard.tsx`)
- **Summary Cards**: Total energy, cost, carbon emissions, efficiency score
- **Interactive Charts**: Line charts for trends, pie charts for breakdowns
- **Recommendations**: AI-powered optimization suggestions
- **Real-time Data**: Auto-refreshing metrics

### 2. Chart Components
- **EnergyUsageChart**: Line/bar charts for energy, cost, and carbon trends
- **ResourceBreakdownChart**: Pie charts showing resource type distribution

### 3. API Integration (`/src/utils/api.ts`)
- Axios-based API client
- Type-safe data fetching
- Error handling and loading states

## Data Flow

```
AWS Resources → Backend API → Frontend Dashboard → Charts & Visualizations
     ↓              ↓              ↓                    ↓
  Real Usage    Mock Data     React State         Recharts
```

## Chart Types & Metrics

### 1. Energy Usage Trends
- **Line Charts**: Show energy consumption over time
- **Metrics**: kWh, Cost ($), Carbon (kg CO2)
- **Periods**: Hourly, Daily, Weekly, Monthly

### 2. Resource Breakdown
- **Pie Charts**: Distribution by AWS service type
- **Services**: EC2, RDS, Lambda, S3, CloudFront
- **Color Coding**: Consistent colors per service

### 3. Efficiency Metrics
- **Score**: 0-100 efficiency rating
- **Trends**: Increasing/Decreasing/Stable indicators
- **Recommendations**: Prioritized optimization suggestions

## Customization Options

### 1. Adding New Metrics
1. Update `EnergyUsage` interface in `/backend/src/models/EnergyUsage.ts`
2. Modify API endpoints in `/backend/src/routes/energy.ts`
3. Update frontend types in `/frontend/src/types/energy.ts`
4. Add chart components as needed

### 2. New Chart Types
1. Install additional Recharts components
2. Create new chart components in `/frontend/src/components/charts/`
3. Integrate into dashboard

### 3. Styling Customization
- **Tailwind CSS**: Modify `tailwind.config.js`
- **Colors**: Update color schemes in chart components
- **Layout**: Adjust grid layouts in dashboard

## Production Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Environment Variables
- **Backend**: `PORT`, `NODE_ENV`, `CORS_ORIGIN`
- **Frontend**: `NEXT_PUBLIC_API_URL`

## Next Steps

1. **Install Frontend Dependencies**: Run `npm install` in the frontend directory
2. **Start Frontend**: Run `npm run dev` to start the development server
3. **Test Integration**: Visit `http://localhost:3000` to see the dashboard
4. **Customize**: Modify components and styling as needed
5. **Add Real Data**: Replace mock data with actual AWS API integration

## AWS Integration (Future)

To connect with real AWS data:
1. **AWS SDK**: Install and configure AWS SDK in backend
2. **CloudWatch**: Fetch metrics from CloudWatch
3. **Cost Explorer**: Get cost data from AWS Cost Explorer API
4. **Resource Groups**: Query resource information
5. **Authentication**: Implement AWS IAM roles and policies

## Testing the Setup

1. **Backend Health Check**: `curl http://localhost:3100/health`
2. **API Test**: `curl http://localhost:3100/api/energy/dashboard`
3. **Frontend**: Visit `http://localhost:3000` after starting the frontend

Your backend is already running and ready to serve data to the frontend!
