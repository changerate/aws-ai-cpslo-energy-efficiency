import pandas as pd






def cleanExcel(excelFileName: str) -> None:

    file_path = "../Data/" + excelFileName

    df = pd.read_excel(file_path)

    # Remove rows where all columns except 'Timestamp' are NaN
    df_cleaned = df.dropna(subset=[col for col in df.columns if col != 'Timestamp'], how='all')

    # Optional: reset index
    df_cleaned.reset_index(drop=True, inplace=True)

    # Display the first few rows
    # print(df_cleaned.head())

    # Save
    saveFile = "./cleaned_data/" + excelFileName.strip('.xlsx') + ".csv"
    df_cleaned.to_csv(saveFile, index=False)

    print(f"Saved to: {saveFile}")








allExcelFiles = [
'HistorianTable 1-2022.xlsx',
'HistorianTable 1-2023.xlsx',
'HistorianTable 1-2024.xlsx',
'HistorianTable 1-2025.xlsx',
'HistorianTable 10-2021.xlsx',
'HistorianTable 10-2022.xlsx',
'HistorianTable 10-2023.xlsx',
'HistorianTable 10-2024.xlsx',
'HistorianTable 11-2021.xlsx',
'HistorianTable 11-2022.xlsx',
'HistorianTable 11-2023.xlsx',
'HistorianTable 11-2024.xlsx',
'HistorianTable 12-2021.xlsx',
'HistorianTable 12-2022.xlsx',
'HistorianTable 12-2023.xlsx',
'HistorianTable 12-2024.xlsx',
'HistorianTable 2-2022.xlsx',
'HistorianTable 2-2023.xlsx',
'HistorianTable 2-2024.xlsx',
'HistorianTable 2-2025.xlsx',
'HistorianTable 3-2022.xlsx',
'HistorianTable 3-2023.xlsx',
'HistorianTable 3-2024.xlsx',
'HistorianTable 3-2025.xlsx',
'HistorianTable 4-2022.xlsx',
'HistorianTable 4-2023.xlsx',
'HistorianTable 4-2024.xlsx',
'HistorianTable 4-2025.xlsx',
'HistorianTable 5-2022.xlsx',
'HistorianTable 5-2023.xlsx',
'HistorianTable 5-2024.xlsx',
'HistorianTable 5-2025.xlsx',
'HistorianTable 6-2022.xlsx',
'HistorianTable 6-2023.xlsx',
'HistorianTable 6-2024.xlsx',
'HistorianTable 6-2025.xlsx',
'HistorianTable 7-2021.xlsx',
'HistorianTable 7-2022.xlsx',
'HistorianTable 7-2023.xlsx',
'HistorianTable 7-2024.xlsx',
'HistorianTable 8-2021.xlsx',
'HistorianTable 8-2022.xlsx',
'HistorianTable 8-2023.xlsx',
'HistorianTable 8-2024.xlsx',
'HistorianTable 9-2021.xlsx',
'HistorianTable 9-2022.xlsx',
'HistorianTable 9-2023.xlsx',
'HistorianTable 9-2024.xlsx',
]


for file in allExcelFiles:
    cleanExcel(file.strip())

print(f"\n\nFinished cleaning! 🧼")