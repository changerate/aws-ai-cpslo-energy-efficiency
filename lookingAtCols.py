import pandas as pd
import re

cols = "Timestamp	HWP2 Pump Speed Status	Building HHW Loop HHW Return Temp	Building HHW Loop HHW Supply Flow	Building HHW Loop HHW Supply Temp	AHU1A Cooling Valve Cmd	AHU1A Heating Valve Cmd	AHU1A Outside Air Temp	AHU1A Return Air Fan Command (C)	AHU1A Supply Air Fan Command (C)	AHU1B Cooling Valve Cmd	AHU1B Heating Valve Cmd	AHU1B Outside Air Temp	AHU1B Return Air Fan Command (C)	AHU1B Supply Air Fan Command (C)	AHU2A Cooling Valve Cmd	AHU2A Heating Valve Cmd	AHU2A Outside Air Temp	AHU2A Return Air Fan Command (C)	AHU2A Supply Air Fan Command (C)	AHU2B Cooling Valve Cmd	AHU2B Heating Valve Cmd	AHU2B Outside Air Temp	AHU2B Return Air Fan Command (C)	AHU2B Supply Air Fan Command (C)	AHU3A Cooling Valve Cmd	AHU3A Heating Valve Cmd	AHU3A Outside Air Temp	AHU3A Return Air Fan Command (C)	AHU3A Supply Air Fan Command (C)	AHU3B Cooling Valve Cmd	AHU3B Heating Valve Cmd	AHU3B Outside Air Temp	AHU3B Return Air Fan Command (C)	AHU3B Supply Air Fan Command (C)	AHU4A Cooling Valve Cmd	AHU4A Heating Valve Cmd	AHU4A Outside Air Temp	AHU4A Return Air Fan Command (C)	AHU4A Supply Air Fan Command (C)	AHU4B Cooling Valve Cmd	AHU4B Heating Valve Cmd	AHU4B Outside Air Temp	AHU4B Return Air Fan Command (C)	AHU4B Supply Air Fan Command (C)	AHU5A Cooling Valve Cmd	AHU5A Heating Valve Cmd	AHU5A Outside Air Temp	AHU5A Return Air Fan Command (C)	AHU5A Supply Air Fan Command (C)	AHU5B Cooling Valve Cmd	AHU5B Heating Valve Cmd	AHU5B Outside Air Temp	AHU5B Return Air Fan Command (C)	AHU5B Supply Air Fan Command (C)	AHU6A Cooling Valve Cmd	AHU6A Heating Valve Cmd	AHU6A Outside Air Temp	AHU6A Return Air Fan Command (C)	AHU6A Supply Air Fan Command (C)	CHWP1 Pump Speed Status	CHWP2 Pump Speed Status	HWP1 Pump Speed Status	N4-CHW-MTR: Main Usage (kBTU)	N4-HHW-MTR: Main Usage (kBTU)	Tertiary CHW Loop CHW Return Temp	Tertiary CHW Loop CHW Supply Flow	Tertiary CHW Loop CHW Supply Temp	Total Electric Demand (C)	Total Electric Usage (C)	Total Natural Gas Usage (C)"

cols = cols.split('\t')

cols2 = []


"""
FINDING THE UNIQUE COLUMNS
"""
# for idx, col in enumerate(cols): 
#     colSplit = re.split(r'^[A-Za-z0-9]{5}\s', col)

#     if len(colSplit) == 2:
#         cols2 += [colSplit[1]]
#         print(f"{idx+1}.\t{colSplit[1]}")

#     elif len(colSplit) == 1: 
#         cols2 += [colSplit[0]]
#         print(f"{idx+1}.\t{colSplit[0]}")


# print(f"Number cols: {len(cols2)}")
# print(f"Number unique: {len(set(cols2))}")

# print(f"\n\nThese are the unique cols:\n")
# for idx, col in enumerate(set(cols2)):
#     print(f"{idx + 1}.\t{col}")






"""
FINDING THE UNQIUE BUILDINGS
"""
uniqueBuildings = set()
for idx, col in enumerate(cols): 
    bldg = re.findall(r'^[A-Za-z0-9]{5}\s', col)
    
    if len(bldg) == 1 and 'total' not in bldg[0].lower():
        print(f"Bldg: {bldg}")
        uniqueBuildings.add(bldg[0])
        # uniqueBuildings.add(bldg[0].trim())
    
print(f"\n\nThe unique buildings are:\n")
for bldg in sorted(uniqueBuildings):
    print(f"{bldg}")

















# cols = {
#     "Timestamp" : "time...",
#     "HHW" : "Heating Hot Water Loop",
#     "CHW" : "Chilled Water Loop",
#     "AHUs" : "Air Hnadling Units",
    
#     "Building HHW Loop HHW Return Temp" : "",
#     "Building HHW Loop HHW Supply Flow" : "",
#     "Building HHW Loop HHW Supply Temp" : "",
#     "Cooling Valve Cmd" : "",
#     "Heating Valve Cmd" : "",
#     "Outside Air Temp" : "",
#     "Return Air Fan Command (C)" : "",
#     "Supply Air Fan Command (C)" : "",
#     "Pump Speed Status" : "",
#     "Pump Speed Status" : "",
#     "Pump Speed Status" : "",
#     "N4-CHW-MTR: Main Usage (kBTU)" : "",
#     "N4-HHW-MTR: Main Usage (kBTU)" : "",
#     "Tertiary CHW Loop CHW Return Temp" : "",
#     "Tertiary CHW Loop CHW Supply Flow" : "",
#     "Tertiary CHW Loop CHW Supply Temp" : "",
#     "Total Electric Demand (C)" : "",
#     "Total Electric Usage (C)" : "",
#     "Total Natural Gas Usage (C)" : "",
# }