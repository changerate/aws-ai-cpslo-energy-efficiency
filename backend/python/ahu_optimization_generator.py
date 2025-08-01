#!/usr/bin/env python3
"""
AHU Optimization Data Generator for Bar Graphs

This script reads the class schedule CSV and generates AHU on/off optimization data
specifically formatted for the "Air-Handler Unit Optimization" bar graphs.

The algorithm maps existing AHU units to the desired format:
AHU01A, AHU01B, AHU02A, AHU02B, AHU03A → AHU-1, AHU-2, AHU-3, AHU-4, AHU-5

Usage:
    python3 ahu_optimization_generator.py --csv-path /path/to/schedule.csv --date 2025-01-27
"""

import argparse
import json
import sys
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Set, Tuple
import os

class AHUOptimizationGenerator:
    def __init__(self, csv_path: str, target_date: str = None):
        self.csv_path = csv_path
        self.target_date = target_date or datetime.now().strftime('%Y-%m-%d')
        
        # Target AHU units for the bar graphs
        self.target_ahu_units = ['AHU-1', 'AHU-2', 'AHU-3', 'AHU-4', 'AHU-5']
        
        # Mapping from CSV AHU units to target format
        self.ahu_mapping = {
            'AHU01A': 'AHU-1',
            'AHU01B': 'AHU-2', 
            'AHU02A': 'AHU-3',
            'AHU02B': 'AHU-4',
            'AHU03A': 'AHU-5'
        }
        
        # Generate hourly time slots for the day (24 hours)
        self.time_slots = self._generate_hourly_slots()
        
    def _generate_hourly_slots(self) -> List[str]:
        """Generate hourly time slots for 24 hours"""
        slots = []
        for hour in range(24):
            slots.append(f"{hour:02d}:00")
        return slots
    
    def load_class_schedule(self) -> pd.DataFrame:
        """Load and validate class schedule from CSV"""
        try:
            if not os.path.exists(self.csv_path):
                raise FileNotFoundError(f"CSV file not found: {self.csv_path}")
            
            # Read CSV file
            df = pd.read_csv(self.csv_path)
            
            # Validate required columns
            required_columns = ['Title/Meeting Name', 'Date', 'StartDT', 'EndDT', 'AHU']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                raise ValueError(f"Missing required columns: {missing_columns}")
            
            # Convert target_date to match the Date format in CSV (MM/DD/YY)
            target_date_obj = datetime.strptime(self.target_date, '%Y-%m-%d')
            target_date_csv_format = target_date_obj.strftime('%m/%d/%y')
            
            # Filter for target date
            df_filtered = df[df['Date'] == target_date_csv_format].copy()
            
            # Parse datetime columns
            df_filtered['start_datetime'] = pd.to_datetime(df_filtered['StartDT'])
            df_filtered['end_datetime'] = pd.to_datetime(df_filtered['EndDT'])
            
            # Map AHU units to target format
            df_filtered['mapped_ahu'] = df_filtered['AHU'].map(self.ahu_mapping)
            
            # Filter out unmapped AHU units
            df_filtered = df_filtered.dropna(subset=['mapped_ahu'])
            
            print(f"Found {len(df_filtered)} classes for {target_date_csv_format}", file=sys.stderr)
            print(f"Mapped AHU units: {sorted(df_filtered['mapped_ahu'].unique())}", file=sys.stderr)
            
            return df_filtered
            
        except Exception as e:
            raise Exception(f"Error loading class schedule: {str(e)}")
    
    def _is_ahu_active_in_hour(self, ahu_classes: pd.DataFrame, hour: int) -> bool:
        """Check if AHU should be active during a specific hour"""
        hour_start = datetime.strptime(self.target_date, '%Y-%m-%d').replace(hour=hour, minute=0, second=0)
        hour_end = hour_start + timedelta(hours=1)
        
        for _, class_row in ahu_classes.iterrows():
            class_start = class_row['start_datetime']
            class_end = class_row['end_datetime']
            
            # Check if class overlaps with this hour
            if class_start < hour_end and class_end > hour_start:
                return True
        
        return False
    
    def generate_optimization_data(self) -> Dict:
        """Generate AHU optimization data for bar graphs"""
        try:
            # Load class schedule
            class_df = self.load_class_schedule()
            
            if len(class_df) == 0:
                # Return default data if no classes found
                return self._generate_default_data()
            
            # Initialize data structure for bar graphs
            ahu_data = []
            total_energy_saved = 0
            total_cost_saved = 0
            
            # Process each AHU unit
            for ahu_unit in self.target_ahu_units:
                # Get classes for this AHU unit
                ahu_classes = class_df[class_df['mapped_ahu'] == ahu_unit]
                
                # Calculate hourly on/off status
                on_hours = 0
                off_hours = 0
                hourly_schedule = []
                
                for hour in range(24):
                    is_active = self._is_ahu_active_in_hour(ahu_classes, hour)
                    
                    if is_active:
                        on_hours += 1
                    else:
                        off_hours += 1
                    
                    hourly_schedule.append({
                        'hour': f"{hour:02d}:00",
                        'active': is_active,
                        'reason': 'Classes scheduled' if is_active else 'No classes - optimized OFF'
                    })
                
                # Calculate energy metrics (assuming 50 kWh per hour per AHU, $0.12/kWh)
                energy_consumed = on_hours * 50  # kWh
                energy_saved = off_hours * 50    # kWh
                cost_saved = energy_saved * 0.12 # USD
                
                total_energy_saved += energy_saved
                total_cost_saved += cost_saved
                
                # Create AHU data entry
                ahu_entry = {
                    'ahu_unit': ahu_unit,
                    'on_hours': on_hours,
                    'off_hours': off_hours,
                    'energy_consumed_kwh': energy_consumed,
                    'energy_saved_kwh': energy_saved,
                    'cost_saved_usd': round(cost_saved, 2),
                    'efficiency_percentage': round((off_hours / 24) * 100, 1),
                    'classes_served': len(ahu_classes),
                    'hourly_schedule': hourly_schedule
                }
                
                ahu_data.append(ahu_entry)
            
            # Prepare final response
            result = {
                'success': True,
                'date': self.target_date,
                'ahu_optimization_data': ahu_data,
                'summary': {
                    'total_ahu_units': len(self.target_ahu_units),
                    'total_energy_saved_kwh': round(total_energy_saved, 2),
                    'total_cost_saved_usd': round(total_cost_saved, 2),
                    'average_efficiency_percentage': round(sum(entry['efficiency_percentage'] for entry in ahu_data) / len(ahu_data), 1),
                    'total_classes_processed': len(class_df)
                },
                'csv_file': self.csv_path
            }
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'date': self.target_date,
                'csv_file': self.csv_path
            }
    
    def _generate_default_data(self) -> Dict:
        """Generate default data when no classes are found"""
        ahu_data = []
        
        for ahu_unit in self.target_ahu_units:
            # Assume all hours are OFF if no classes
            hourly_schedule = []
            for hour in range(24):
                hourly_schedule.append({
                    'hour': f"{hour:02d}:00",
                    'active': False,
                    'reason': 'No classes scheduled - optimized OFF'
                })
            
            ahu_entry = {
                'ahu_unit': ahu_unit,
                'on_hours': 0,
                'off_hours': 24,
                'energy_consumed_kwh': 0,
                'energy_saved_kwh': 1200,  # 24 hours * 50 kWh
                'cost_saved_usd': 144.0,   # 1200 kWh * $0.12
                'efficiency_percentage': 100.0,
                'classes_served': 0,
                'hourly_schedule': hourly_schedule
            }
            
            ahu_data.append(ahu_entry)
        
        return {
            'success': True,
            'date': self.target_date,
            'ahu_optimization_data': ahu_data,
            'summary': {
                'total_ahu_units': len(self.target_ahu_units),
                'total_energy_saved_kwh': 6000.0,  # 5 units * 1200 kWh
                'total_cost_saved_usd': 720.0,     # 6000 kWh * $0.12
                'average_efficiency_percentage': 100.0,
                'total_classes_processed': 0
            },
            'csv_file': self.csv_path
        }

def main():
    parser = argparse.ArgumentParser(description='Generate AHU optimization data for bar graphs')
    parser.add_argument('--csv-path', required=True, help='Path to class schedule CSV file')
    parser.add_argument('--date', help='Target date (YYYY-MM-DD), defaults to today')
    parser.add_argument('--output-format', default='json', choices=['json', 'pretty'], 
                       help='Output format')
    
    args = parser.parse_args()
    
    try:
        # Create generator instance
        generator = AHUOptimizationGenerator(
            csv_path=args.csv_path,
            target_date=args.date
        )
        
        # Generate optimization data
        result = generator.generate_optimization_data()
        
        # Output result
        if args.output_format == 'pretty':
            print(json.dumps(result, indent=2))
        else:
            print(json.dumps(result))
            
    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e)
        }
        print(json.dumps(error_result), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
