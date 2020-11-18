#ifndef UTILS_H
#define UTILS_H

#include <sys/resource.h>
#include <time.h>

long get_hrtime();
long get_cputime(int who);

#endif
