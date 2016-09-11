// #include <Plotter.h>
// #include "perlin.c"
// #include "noise_grid.h"
//
// float noiseScale = 0.2;
//
// Point gridPoint(int i) {
//   float l = floor(.5*(1+sqrt(i)));
//   float a = 2*l - 1;
//   float offset = i - a*a;
//   Point point;
//   if (offset < 2*l) {
//     point.x = l;
//     point.y = offset - l + 1;
//   } else if (offset < 4*l) {
//     point.x = 3*l - offset - 1;
//     point.y = l;
//   } else if (offset < 6*l) {
//     point.x = -l;
//     point.y = 5*l - offset - 1;
//   } else {
//     point.x = -7*l + offset + 1;
//     point.y = -l;
//   }
//   return point;
// }
//
// Point noiseGrid(int i) {
//   Point point = gridPoint(i);
//   float distance = sqrt(point.x*point.x + point.y*point.y);
//   float amplitude = max(0,1.0 - pow(distance/LOOPS, 0.5));
//   float noiseX = amplitude * noiseScale * LOOP_SCALE * point.x;
//   float noiseY = amplitude * noiseScale * LOOP_SCALE * point.y;
//   float xNoise = pnoise(noiseX, noiseY, xOffset);
//   float yNoise = pnoise(noiseX, noiseY, yOffset);
//
//   Point target;
//   target.x = point.x * LOOP_SCALE + xNoiseAmplitude * xNoise;
//   target.y = point.y * LOOP_SCALE + yNoiseAmplitude * yNoise;
//   return target;
// }
