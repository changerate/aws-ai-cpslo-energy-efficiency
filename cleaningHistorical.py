import pandas as pd


file_path = "../Data/HistorianTable 1-2022.xlsx"

df = pd.read_excel(file_path)

# Remove rows where all columns except 'Timestamp' are NaN
df_cleaned = df.dropna(subset=[col for col in df.columns if col != 'Timestamp'], how='all')

# Optional: reset index
df_cleaned.reset_index(drop=True, inplace=True)

# Display the first few rows
print(df_cleaned.head())

# Save to Excel
df_cleaned.to_excel("cleaned_output.xlsx", index=False)
