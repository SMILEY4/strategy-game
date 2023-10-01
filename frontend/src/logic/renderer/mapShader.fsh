#version 300 es
#line 2
precision mediump float;

flat in vec4 v_tilePosition;
flat in vec2 v_terrain;
in vec2 v_textureCoordinates;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
    vec4 baseColor = texture(u_texture, v_textureCoordinates);

    int visibility = int(v_terrain.x);

    if (visibility == 0) {
        outColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
    if (visibility == 1) {
        outColor = vec4(0.0, 1.0, 0.0, 1.0);
    }
    if (visibility == 2) {
        outColor = vec4(0.0, 0.0, 1.0, 1.0);
    }


//        vec4 baseColor = texture(u_texture, v_textureCoordinates);
//        vec3 finalColor = vec3(0.2);
//        if(v_terrain.x == 0) {
//            finalColor = baseColor.rgb * vec3(0.2);
//        }
//        if(v_terrain.x == 1) {
//            finalColor = baseColor.rgb * vec3(0.6);
//        }
//        if(v_terrain.x == 2) {
//            finalColor = baseColor.rgb;
//        }
//        outColor = vec4(finalColor.rgb, 1.0);
}
