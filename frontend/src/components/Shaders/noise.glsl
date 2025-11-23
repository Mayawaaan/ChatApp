//
// Description : Array and textureless GLSL 4D simplex noise function.
//               Ported from Stefan Gustavson's C code.
//               http://staffwww.itn.liu.se/~stegu/simplexnoise/SimplexNoise.glsl
//
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2012-02-11
//
// This code is released under the MIT license.
//
// In 4D, the simplex is a pentachoron (5-cell).
// The noise function is a sum of 5-cells, each with a different random orientation.
//

vec4 permute(vec4 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec4 v) {
    const vec4 C = vec4(0.1381966011250105, // (5 - sqrt(5))/20  G4
                        0.276393202250021,  // 2 * G4
                        0.4145898033750315, // 3 * G4
                        -0.4472135954999579 // -1 + 4 * G4
    );

    // First corner
    vec4 i = floor(v + dot(v, C.yyyy));
    vec4 x0 = v - i + dot(i, C.xxxx);

    // Other corners
    // Rank each axis by which one has the largest fractional part,
    // to determine the order of the simplex vertices.
    vec4 p = permute(permute(i.w + vec4(0.0, 1.0, 2.0, 3.0)) + i.z);
    p = permute(permute(p + i.y) + i.x);

    vec4 j = permute(permute(permute(i.w + vec4(0.0, 1.0, 2.0, 3.0)) + i.z) + i.y);
    j = permute(permute(j + i.x));

    vec4 o1 = step(x0.y, x0.x);
    vec4 o2 = step(x0.z, x0.y);
    vec4 o3 = step(x0.w, x0.z);

    vec4 s = vec4(o1.x + o1.y + o1.z + o1.w,
                  o2.x + o2.y + o2.z + o2.w,
                  o3.x + o3.y + o3.z + o3.w,
                  0.0);

    vec4 x1 = x0 - C.xxxx + s;
    vec4 x2 = x0 - C.yyyy + s;
    vec4 x3 = x0 - C.zzzz + s;
    vec4 x4 = x0 - C.wwww + s;

    // Gradients
    vec4 G = vec4(0.0, 0.0, 0.0, 0.0);
    G.x = dot(x0, permute(p));
    G.y = dot(x1, permute(p + 1.0));
    G.z = dot(x2, permute(p + 2.0));
    G.w = dot(x3, permute(p + 3.0));

    // Contribution from each simplex vertex
    vec4 t = 0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3));
    t = max(t, 0.0);
    vec4 t2 = t * t;
    vec4 t4 = t2 * t2;

    return 34.0 * dot(t4, G);
}