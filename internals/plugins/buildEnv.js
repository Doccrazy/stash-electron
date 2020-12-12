if (process.cwd().endsWith('nodegit') || process.cwd().endsWith('keytar')) {
    process.env.npm_config_fallback_to_build = 'true';
    process.env.npm_config_update_binary = 'true';
    process.env.npm_config_runtime = 'electron';
    process.env.npm_config_target = '9.1.2';
}