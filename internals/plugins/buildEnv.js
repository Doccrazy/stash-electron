if (process.cwd().endsWith('nodegit') || process.cwd().endsWith('keytar')) {
    process.env.npm_config_fallback_to_build = 'true';
    process.env.npm_config_update_binary = 'true';
    process.env.npm_config_runtime = 'electron';
    process.env.npm_config_target = '27.1.0';
    process.env.npm_config_disturl = 'https://electronjs.org/headers';
}

// workaround for PnP in dev mode
const Module = require('node:module');
const originalModuleLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (typeof parent === 'function') {
    return originalModuleLoad.call(Module, request, undefined, isMain);
  }
  return originalModuleLoad.call(Module, request, parent, isMain);
}
