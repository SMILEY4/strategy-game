#pragma module(terrainColor)
vec3 terrainColor(float terrainId) {
    if (terrainId < -0.5) { // -1 -> undiscovered
        return vec3(0.2);
    }
    if (terrainId < 0.5) { // 0 -> water
        return vec3(1.0/255.0, 96.0/255.0, 154.0/255.0);
    }
    if (terrainId < 1.5) { // 1 -> land
        return vec3(87.0/255.0, 139.0/255.0, 69.0/255.0);
    }
    if (terrainId < 2.5) { // 2 -> mountain
        return vec3(88.0/255.0, 99.0/255.0, 85.0/255.0);
    }
    return vec3(0.0);
}
#pragma endModule



#pragma module(grayscaleColor)
vec3 grayscaleColor(vec3 color, float boost) {
    return (vec3(color.r+color.g+color.b) / 3.0) * boost;
}
#pragma endModule



#pragma module(resourceColor)
vec3 resourceColor(float resourceId) {
    if(resourceId < 0.5) { // forest
        return vec3(21.0 / 255.0, 112.0 / 255.0, 49.0 / 255.0);
    }
    if(resourceId < 1.5) { // fish
        return vec3(57.0 / 255.0, 96.0 / 255.0, 204.0 / 255.0);
    }
    if(resourceId < 2.5) { // stone
        return vec3(74.0 / 255.0, 74.0 / 255.0, 74.0 / 255.0);
    }
    if(resourceId < 3.5) { // metal
        return vec3(150.0 / 255.0, 150.0 / 255.0, 150.0 / 255.0);
    }
    return vec3(0.0);
}
#pragma endModule



#pragma module(blend)
vec3 blend(vec3 background, vec4 foreground) {
    return vec3(
        background.r * (1.0 - foreground.a) + foreground.r * foreground.a,
        background.g * (1.0 - foreground.a) + foreground.g * foreground.a,
        background.b * (1.0 - foreground.a) + foreground.b * foreground.a
    );
}
#pragma endModule



#pragma module(eqFloat)
bool eqFloat(float actual, float expected) {
    float delta = 0.0001;
    return (expected - delta) < actual && actual < (expected + delta);
}
#pragma endModule


#pragma module(eqVec2)
bool eqVec2(vec2 actual, vec2 expected) {
    float delta = 0.0001;
    return abs(actual.x - expected.x) < delta && abs(actual.y - expected.y) < delta;
}
#pragma endModule

#pragma module(isTrueFloat)
bool isTrueFloat(float actual) {
    float delta = 0.0001;
    return !(-delta < actual && actual < +delta);
}
#pragma endModule