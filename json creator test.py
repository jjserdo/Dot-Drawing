# -*- coding: utf-8 -*-
"""
Created on Fri Apr 14 22:09:09 2023

@author: jjser
Author: Justine John A. Serdoncillo
Python --> JSON for points
    - want to create a code that will create a json object of arrays that can save points
    - 
"""

import json

# %%
def horizontal(points, rows, cols):
    """
        points - array, (N,2,2)
            - connects two points together
    """
    for row in range(rows):
        for col in range(cols):
            # Create a point object with its x and y coordinates
            point = {
                "x": col * 2 if row % 2 == 0 else col * 2 + 1,
                "y": row
            }
            points.append(point)
    return points

def vertical(points, rows, cols):
    for row in range(rows):
        for col in range(cols):
            # Create a point object with its x and y coordinates
            point = {
                "x": row,
                "y": col * 2 if row % 2 == 0 else col * 2 + 1
            }
            points.append(point)
    return points

# %%

def createPoints():
    # Create an empty list to hold the points
    points = []
    
    # Create a dictionary containing the points array
    data = {"points": points}

    return data
# %%

if 

# Write the dictionary to a JSON file
with open("points.json", "w") as outfile:
    json.dump(data, outfile)
