vec3 simplexNoise2D_permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}

// Generates smooth 2D Simplex Noise in range [-1.0, 1.0]
float simplexNoise2D(vec2 v) {
    const vec4 C = vec4(
            +0.21132486, // (3.0 - sqrt(3.0)) / 6.0
            +0.36602540, // 0.5 * (sqrt(3.0) - 1.0)
            -0.57735026, // -1.0 + 2.0 * C.x
            +0.02439024  // 1.0 / 41.0
    );
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = simplexNoise2D_permute(simplexNoise2D_permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

// 2-Octave Fractal Brownian Motion (fBm)
vec2 domainNoise2D(vec2 p) {
    // Primary large-scale noise
    float nX = simplexNoise2D(p);
    float nY = simplexNoise2D(p + vec2(5.2, 1.3));

    // Secondary fine-scale noise (octave 2)
    nX += 0.5 * simplexNoise2D(p * 2.08 + vec2(1.7, 9.2));
    nY += 0.5 * simplexNoise2D(p * 2.08 + vec2(8.3, 2.8));

    return vec2(nX, nY);
}