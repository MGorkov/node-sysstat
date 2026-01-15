#include "utils.h"

constexpr double NANOS_PER_SEC = 1e9;

long get_hrtime() {
  struct timespec hrtime;

  if (clock_gettime(CLOCK_MONOTONIC, &hrtime) == 0) {
    return hrtime.tv_sec * NANOS_PER_SEC + hrtime.tv_nsec;
  } else {
    return 0;
  }
}

long get_cputime(clockid_t clockid) {
  struct timespec stats;

  if (clock_gettime(clockid, &stats) == 0) {
    return stats.tv_sec * NANOS_PER_SEC + stats.tv_nsec;
  } else {
    return 0;
  }
}
