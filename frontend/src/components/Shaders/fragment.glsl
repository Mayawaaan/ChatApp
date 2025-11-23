varying vec2 vUv;
uniform vec3 colorA;
uniform vec3 colorB;

void main() {
    // Mix colorA and colorB based on the vertical texture coordinate (vUv.y)
    vec3 finalColor = mix(colorA, colorB, vUv.y);
    gl_FragColor = vec4(finalColor, 1.0);
}