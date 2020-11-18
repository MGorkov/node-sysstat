#include "utils.h"

constexpr double MICROS_PER_SEC = 1e6;
constexpr double NANOS_PER_SEC = 1e9;

long get_hrtime() {
  struct timespec hrtime;

  if (clock_gettime(CLOCK_MONOTONIC, &hrtime) == 0) {
    return hrtime.tv_sec * NANOS_PER_SEC + hrtime.tv_nsec;
  } else {
    return 0;
  }
}

long get_cputime(int who) {
  struct rusage stats;

  if (getrusage(who, &stats) == 0) {
    long user_cpu = stats.ru_utime.tv_sec * MICROS_PER_SEC + stats.ru_utime.tv_usec;
    long kernel_cpu = stats.ru_stime.tv_sec * MICROS_PER_SEC + stats.ru_stime.tv_usec;
    return user_cpu + kernel_cpu;
  } else {
    return 0;
  }
}
