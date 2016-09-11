// #include <Plotter.h>
// #include "perlin.c"
// #include "spirals.h"
//
// Point spirals(int i) {
//   Point point;
//   float inc = 1.0 / (NUM_POINTS-1.0);
//   float frac = inc * i;
//   float theta = 2.0*PI * LOOPS * frac;
//   float distort = -1.0 + 2.0 * pnoise(3.0*frac, sin(theta*2.501), 150.0);
//   float r = RADIUS * (1.0 - pow(frac,8.0)) * distort;
//   // r = RADIUS * frac;
//   point.x = r*cos(theta);
//   point.y = r*sin(theta);
//   return point;
// }
