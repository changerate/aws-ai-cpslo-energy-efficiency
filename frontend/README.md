# CSU Energy Management System

A React-based web application designed to help the CSU system optimize HVAC energy usage and reduce costs based on class schedules and historical energy data.

## Features

### 📅 Class Schedule Upload
- Upload CSV files containing class schedules
- Drag-and-drop interface for easy file handling
- Automatic parsing and validation of schedule data
- Preview of uploaded schedule with course details

### ⚡ Energy Usage Analysis
- Interactive charts showing current vs. optimized energy usage
- Real-time comparison of energy consumption patterns
- Visual representation of potential energy savings
- Daily, monthly, and annual energy metrics

### 🏢 HVAC Control Schedule
- Color-coded schedule showing when HVAC should be on/off
- Day-by-day view with hourly breakdowns
- Interactive time slots with detailed information
- Energy-saving recommendations based on building occupancy

### 💰 Cost Analysis & Savings
- Real-time cost calculations based on utility rates
- Projected savings from optimized HVAC scheduling
- ROI analysis and payback period calculations
- Monthly and annual cost projections

## Installation

1. **Clone or download the project files**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## Usage

### 1. Upload Class Schedule
- Click on the upload area or drag and drop a CSV file
- CSV format should include: Course Name, Instructor, Days, Start Time, End Time, Room, Building
- Use the provided `sample-schedule.csv` for testing

### 2. View Energy Analysis
- The energy chart automatically displays sample data
- Compare current usage (red) vs. optimized usage (green)
- View daily energy savings potential

### 3. Review HVAC Schedule
- Select different days to view HVAC recommendations
- Red time slots indicate HVAC should be ON (classes scheduled)
- Green time slots indicate HVAC should be OFF (energy saving)
- Hover over time slots for detailed information

### 4. Analyze Cost Savings
- View current vs. projected daily costs
- See monthly and annual savings projections
- Review ROI calculations and payback periods

## Sample Data

The application includes sample energy data and a sample CSV file (`sample-schedule.csv`) for testing purposes. The sample schedule includes:

- Mathematics, Physics, Chemistry, Biology courses
- Various time slots throughout the week
- Different buildings and room assignments

## Testing

Run the test suite to verify component functionality:

```bash
npm test
```

Tests cover:
- Component rendering and UI elements
- File upload functionality
- Data calculations and display
- User interactions and state changes

## Technical Details

### Built With
- **React 18** - Frontend framework
- **Recharts** - Data visualization library
- **Papa Parse** - CSV parsing library
- **CSS Grid & Flexbox** - Responsive layout

### Key Components
- `ScheduleUpload` - Handles CSV file upload and parsing
- `EnergyChart` - Displays energy usage comparison charts
- `HVACSchedule` - Shows color-coded HVAC control schedule
- `CostAnalysis` - Calculates and displays cost savings

### Data Flow
1. User uploads class schedule CSV
2. Schedule data is parsed and processed
3. HVAC schedule is generated based on class times
4. Energy usage is optimized according to occupancy
5. Cost savings are calculated and displayed

## Customization

### Utility Rates
Modify the utility rate in `App.js`:
```javascript
const ratePerKWh = 0.12; // Change this value
```

### Energy Data
Update the sample energy data in `App.js` to reflect your building's actual usage patterns.

### Styling
Customize the appearance by modifying `App.css` and component-specific styles.

## Future Enhancements

- Integration with real-time energy monitoring systems
- Support for multiple buildings and zones
- Advanced scheduling algorithms
- Weather-based optimization
- Mobile app companion
- API integration for utility billing data

## Support

For questions or issues, please refer to the component tests and documentation within the code files.
