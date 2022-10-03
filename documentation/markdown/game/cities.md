---
title: Cities
---

# Cities

## Creating Cities

**Requirements**

- country must have enough money
- must be build on a "land"-tile
- tile is not owned by another country
- tile does not already have a city
- at least one of the following conditions must be true:
  - the country has the greatest influence on that tile
  - no country has more than x influence on that tile
  - the country is the owner of the tile

**Effects**

- City generates fixed amount of money each turn
- City adds influence to surrounding tiles
- Border spreads based on influence

## Creating Towns

**Requirements**

- must be build on a "land"-tile

- tile must be owned by the country

- tile does not already have a city/town

- country must have enough money

## Influence

Graphs for calculating influence config values:

- open https://www.desmos.com/calculator
- paste following code into console

```javascript
Calc.setState({
   "version": 9,
   "randomSeed": "044ba6c7f04400c14592e096a022e34b",
   "graph": {
      "viewport": {
         "xmin": -3.094242821322963,
         "ymin": 0.16453934682930793,
         "xmax": 25.679981698406706,
         "ymax": 10.021006481359274
      }
   },
   "expressions": {
      "list": [
         {
            "type": "expression",
            "id": "2",
            "color": "#2d70b3",
            "latex": "v_{town}=10",
            "labelSize": "medium",
            "slider": {
               "hardMin": true,
               "hardMax": true,
               "min": "0",
               "max": "20",
               "step": "0.5"
            }
         },
         {
            "type": "expression",
            "id": "29",
            "color": "#2d70b3",
            "latex": "s_{town}=2.5",
            "labelSize": "medium",
            "slider": {
               "hardMin": true,
               "hardMax": true,
               "min": "0",
               "step": "0.5"
            }
         },
         {
            "type": "expression",
            "id": "28",
            "color": "#2d70b3",
            "latex": "v_{city}=10",
            "labelSize": "medium",
            "slider": {
               "hardMin": true,
               "hardMax": true,
               "min": "0",
               "max": "20",
               "step": "0.5"
            }
         },
         {
            "type": "expression",
            "id": "27",
            "color": "#2d70b3",
            "latex": "s_{city}=6.5",
            "labelSize": "medium",
            "slider": {
               "hardMin": true,
               "hardMax": true,
               "min": "0",
               "max": "20",
               "step": "0.5"
            }
         },
         {
            "type": "expression",
            "id": "34",
            "color": "#388c46",
            "latex": "t\\ =5",
            "labelSize": "medium",
            "slider": {
               "hardMin": true,
               "hardMax": true,
               "min": "0",
               "max": "20",
               "step": "1"
            }
         },
         {
            "type": "expression",
            "id": "35",
            "color": "#6042a6"
         },
         {
            "type": "expression",
            "id": "20",
            "color": "#2d70b3",
            "latex": "i\\left(d,v,s\\right)\\ =\\ \\left(-\\frac{d}{s}+1\\right)\\cdot v"
         },
         {
            "type": "expression",
            "id": "4",
            "color": "#2d70b3",
            "latex": "y\\ =\\ i\\left(x,v_{town},s_{town}\\right)",
            "lineWidth": "6"
         },
         {
            "type": "expression",
            "id": "5",
            "color": "#388c46",
            "latex": "y\\ =\\ i\\left(x,v_{city},s_{city}\\right)",
            "lineWidth": "6"
         },
         {
            "type": "expression",
            "id": "31",
            "color": "#000000"
         },
         {
            "type": "expression",
            "id": "1",
            "color": "#c74440",
            "latex": "y\\ =\\ t",
            "lineWidth": "6"
         },
         {
            "type": "expression",
            "id": "7",
            "color": "#000000",
            "latex": "x\\ =\\ 0",
            "lineStyle": "DASHED"
         },
         {
            "type": "expression",
            "id": "9",
            "color": "#000000",
            "latex": "x\\ =\\ 1",
            "lineStyle": "DASHED"
         },
         {
            "type": "expression",
            "id": "12",
            "color": "#000000",
            "latex": "x\\ =\\ 2",
            "lineStyle": "DASHED"
         },
         {
            "type": "expression",
            "id": "18",
            "color": "#000000",
            "latex": "x\\ =\\ 3",
            "lineStyle": "DASHED"
         },
         {
            "type": "expression",
            "id": "17",
            "color": "#000000",
            "latex": "x\\ =\\ 4",
            "lineStyle": "DASHED"
         },
         {
            "type": "expression",
            "id": "16",
            "color": "#000000",
            "latex": "x\\ =\\ 5",
            "lineStyle": "DASHED"
         },
         {
            "type": "expression",
            "id": "15",
            "color": "#000000",
            "latex": "x\\ =\\ 6",
            "lineStyle": "DASHED"
         },
         {
            "type": "expression",
            "id": "14",
            "color": "#000000",
            "latex": "x\\ =7",
            "lineStyle": "DASHED"
         },
         {
            "type": "expression",
            "id": "13",
            "color": "#000000",
            "latex": "x\\ =\\ 8",
            "lineStyle": "DASHED"
         },
         {
            "type": "expression",
            "id": "11",
            "color": "#c74440"
         },
         {
            "type": "expression",
            "id": "3",
            "color": "#388c46"
         },
         {
            "type": "expression",
            "id": "8",
            "color": "#388c46"
         },
         {
            "type": "expression",
            "id": "10",
            "color": "#000000"
         },
         {
            "type": "expression",
            "id": "19",
            "color": "#2d70b3"
         }
      ]
   }
})
```

