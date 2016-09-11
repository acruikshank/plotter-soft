#include <Plotter.h>
#include "perlin.c"
#include "circle.h"

Point circle(int i) {
  Point point;
  float inc = 1.0 / (NUM_POINTS-1.0);
  float frac = inc * i;
  float theta = 2.0*PI * LOOPS * frac;
  float distort = pow(frac,2.0) * pnoise(cos(theta), sin(theta), 4.0*pow(frac,2));
  float r = RADIUS + 10.0*frac + 20.0 * distort;
  point.x = r*cos(theta);
  point.y = r*sin(theta);
  return point;
}
