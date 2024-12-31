
// generates a random number between -1 and +1 based on the given 2d seed
float random(vec2 seed) {
    float value =  fract(sin(dot(seed.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    return value * 2.0 - 1.0;
}

// generates a random 2d vector with values between -1 and +1 based on the given 2d seed
vec2 random2(vec2 seed) {
    return vec2(
        random(seed + vec2(+10.0, -10.0)),
        random(seed + vec2(-10.0, +10.0))
    );
}

vec2 offsetVertexPosition(vec2 vertexPosition, vec2 worldPosition, float seedModifier, float strength) {
    vec2 seed = vertexPosition + worldPosition;
    seed.x = round(seed.x * 200.0) + seedModifier;
    seed.y = round(seed.y * 200.0) + seedModifier;
    return vertexPosition + (random2(seed) * vec2(strength));
}
