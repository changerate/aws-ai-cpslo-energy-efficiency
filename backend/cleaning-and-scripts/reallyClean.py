import pandas as pd
import os 


HVAC_SYSTEM = 'AHU1A'

def extend_with_hvac_units(df, selected_columns, pattern=HVAC_SYSTEM):
    ahu_cols = [c for c in df.columns if pattern in c]

    # preserve order, avoid duplicates
    return list(dict.fromkeys(selected_columns + ahu_cols))





def reallyClean(file):

    fileName = file.split('../../../Data/')
    fileName = fileName[1].split('.xlsx')[0]


    df = pd.read_excel(file)

    # select the columns 
    selected_cols = extend_with_hvac_units(df, ['Timestamp', ' Total Electric Usage (C)', ' Total Electric Demand (C)'])
    df = df[selected_cols]

    df.drop(columns="  " + HVAC_SYSTEM + " Heating Valve Cmd", inplace=True)
    # df = df[ ~ df.drop(columns='Timestamp').isna().all(axis=1)]

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






def collapse_to_minute(file, timestamp_col='Timestamp', agg_map=None, drop_timestamp_seconds=True):

    fileName = file.split('../../../Data/')
    fileName = fileName[1].split('.xlsx')[0]

    df = pd.read_excel(file)

    # df = pd.read_csv(...)
    df['Timestamp'] = pd.to_datetime(df['Timestamp'])

    # normalize timezone / drop tz if any to avoid mismatch
    df['Timestamp'] = df['Timestamp'].dt.tz_localize(None)

    # bucket to minute
    df['__minute'] = df['Timestamp'].dt.floor('T')  # 'T' == minute

    # default agg: numeric -> mean, others -> first
    agg_map = {
        col: ('mean' if pd.api.types.is_numeric_dtype(df[col]) else 'first')
        for col in df.columns
        if col not in ('Timestamp', '__minute')
    }

    collapsed = df.groupby('__minute', as_index=False).agg(agg_map)
    return collapsed.rename(columns={'__minute': 'Timestamp'})






def saveDF(df, file): 
    fileName = file.split('../../../Data/')
    fileName = fileName[1].split('.xlsx')[0]
    
    df.to_csv("cleaned-data/cl-" + fileName + ".csv", index=False)
    print(f"Saved: {fileName + ".csv"}")








def dropAndSave(df, file): 
    fileName = file.split('../../../Data/')
    fileName = fileName[1].split('.xlsx')[0]

    # select the columns 
    selected_cols = extend_with_hvac_units(df, ['Timestamp', ' Total Electric Usage (C)', ' Total Electric Demand (C)'])
    df = df[selected_cols]

    df.drop(columns="  " + HVAC_SYSTEM + " Heating Valve Cmd", inplace=True)
    # df = df[ ~ df.drop(columns='Timestamp').isna().all(axis=1)]

    df.to_csv("cleaned-data/cl-" + fileName + ".csv", index=False)




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
#     # reallyClean("../../../Data/" + file)
#     dfCollapsed = collapse_to_minute('../../../Data/' + file)
#     saveDF(dfCollapsed, '../../../Data/' + file)
#     # dropAndSave(dfCollapsed)
# print(f"\n\nFinished converting")


combine_csvs('./cleaned-data/', 'cl-combinedHistoricalData.csv')
print(f"Finished combining")