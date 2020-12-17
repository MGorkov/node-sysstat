#include <napi.h>
#include "cpuload.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  return CpuLoad::Init(env, exports);
}

NODE_API_MODULE(sysstat, InitAll)
