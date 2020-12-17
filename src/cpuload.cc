#include "cpuload.h"
#include "utils.h"

Napi::Object CpuLoad::Init(Napi::Env env, Napi::Object exports) {

  Napi::Function func = DefineClass(env, "CpuLoad", {
                  InstanceMethod("getThreadCpuLoad", &CpuLoad::getThreadCpuLoad),
                  InstanceMethod("getProcessCpuLoad", &CpuLoad::getProcessCpuLoad)
                  });

  Napi::FunctionReference* constructor = new Napi::FunctionReference();
  *constructor = Napi::Persistent(func);
  env.SetInstanceData(constructor);

  exports.Set("CpuLoad", func);
  return exports;
}

CpuLoad::CpuLoad(const Napi::CallbackInfo& info) : Napi::ObjectWrap<CpuLoad>(info) {

  this->process_hrtime = get_hrtime();
  this->thread_hrtime = get_hrtime();
  this->process_cputime = get_cputime(RUSAGE_SELF);
  this->thread_cputime = get_cputime(RUSAGE_THREAD);
}

Napi::Value CpuLoad::getThreadCpuLoad(const Napi::CallbackInfo& info) {
  long hrtime = get_hrtime();
  long cputime = get_cputime(RUSAGE_THREAD);

  double diff_cputime = cputime - this->thread_cputime;
  this->thread_cputime = cputime;

  double diff_hrtime = hrtime - this->thread_hrtime;
  this->thread_hrtime = hrtime;

  double cpu_usage = 100000 * diff_cputime / diff_hrtime;

  return Napi::Number::New(info.Env(), cpu_usage);
}

Napi::Value CpuLoad::getProcessCpuLoad(const Napi::CallbackInfo& info) {
  long hrtime = get_hrtime();
  long cputime = get_cputime(RUSAGE_SELF);

  double diff_cputime = cputime - this->process_cputime;
  this->process_cputime = cputime;

  double diff_hrtime = hrtime - this->process_hrtime;
  this->process_hrtime = hrtime;

  double cpu_usage = 100000 * diff_cputime / diff_hrtime;

  return Napi::Number::New(info.Env(), cpu_usage);
}

