import pandas as pd
import os
import shutil



def append_csv_to_filenames(dir_path):
    for filename in os.listdir(dir_path):
        old_path = os.path.join(dir_path, filename)
        
        # Skip if it's a directory or already ends with .csv
        if os.path.isdir(old_path) or filename.endswith('.csv'):
            continue

        new_filename = filename + '.csv'
        new_path = os.path.join(dir_path, new_filename)

        # Copy to new .csv file
        shutil.copyfile(old_path, new_path)    



append_csv_to_filenames("./cleaned-data/")