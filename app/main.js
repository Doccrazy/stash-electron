process.env.NODE_OPTIONS = undefined;
setTimeout(() => {
  require('ts-node').register();
  require('./main.ts');
})
