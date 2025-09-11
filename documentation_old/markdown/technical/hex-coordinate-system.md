---
title: Coordinate System
---

# Coordinate System

The game uses the "Axial Coordinate System". Instead of using x and y (and z) coordinates, the hexagonal coordinate-system uses q and r (and s). 

The axis are aligned as follows: 

<img src="images\axis.jpg" alt="axis" style="float:left" />

The "s"-coordinate is usually not stored and can be calculated on the fly from q and r: `s = -q - r` (`q+r+s = 0` must always be true).

This results in the following positions around the origin (image shows the values of "q" and "r"on top and the value of "s" below)

<img src="images\coordinates.jpg" alt="axis" style="float: left; zoom: 50%;" />





## Additional Information

https://www.redblobgames.com/grids/hexagons/#coordinates-axial

- Note: RedBlob assumes an "origin" in the "bottom left of the window". OpenGL uses the top-left as the origin. This results in the r- and s-axis being flipped and switched in comparison to RedBlob. 

https://catlikecoding.com/unity/tutorials/hex-map/part-5/

- Talks about hex-chunks