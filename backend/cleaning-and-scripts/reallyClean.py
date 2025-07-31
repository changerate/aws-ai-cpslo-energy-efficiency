import pandas as pd
import os 








def reallyClean(file):

    fileName = file.split('../Data/')
    fileName = fileName[1].split('.xlsx')[0]


    df = pd.read_excel(file)

    selected_cols = ['Timestamp', ' Total Electric Usage (C)', ' Total Electric Demand (C)']
    df = df[selected_cols]

    df = df[~df.drop(columns='Timestamp').isna().all(axis=1)]

    df.to_csv("cleaned-data/cl-" + fileName + ".csv", index=False)

    print(f"Saved: {fileName + ".csv"}")






def combine_csvs(input_dir, output_file):
    all_dfs = []
    for filename in os.listdir(input_dir):
        if filename.endswith('.csv'):
            file_path = os.path.join(input_dir, filename)
            df = pd.read_csv(file_path)
            all_dfs.append(df)

    combined_df = pd.concat(all_dfs, ignore_index=True)
    combined_df.to_csv(output_file, index=False)





    


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









# for file in allExcelFiles: 
#     reallyClean("../Data/" + file)
    
    
# print(f"Finished converting")


combine_csvs('./cleaned-data/', 'cl-combinedHistoricalData.csv')
print(f"Finished combining")