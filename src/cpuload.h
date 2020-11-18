#ifndef CPULOAD_H
#define CPULOAD_H

#include <napi.h>

class CpuLoad : public Napi::ObjectWrap<CpuLoad> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  CpuLoad(const Napi::CallbackInfo& info);

 private:
  Napi::Value getProcessCpuLoad(const Napi::CallbackInfo& info);
  Napi::Value getThreadCpuLoad(const Napi::CallbackInfo& info);

  long process_hrtime;
  long process_cputime;
  long thread_hrtime;
  long thread_cputime;
};

#endif
