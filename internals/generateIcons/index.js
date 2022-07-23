const fs = require('fs-extra');
const path = require('path');
const svg2png = require('svg2png');
const icongen = require('icon-gen');

const SOURCE = process.argv[2];
const SOURCE_BUF = fs.readFileSync(SOURCE);
const OUTPUT = path.join(__dirname, 'out/resources');
const APP_OUTPUT = path.join(__dirname, 'out/app');

function genLinux(size) {
  console.log(__dirname, `${size}x${size}`);
  const output = svg2png.sync(SOURCE_BUF, { width: size, height: size });
  fs.mkdirpSync(path.join(OUTPUT, 'icons'));
  fs.writeFileSync(path.join(OUTPUT, `icons/${size}x${size}.png`), output);
}

for (const size of [16, 24, 32, 48, 64, 96, 128, 256, 512, 1024]) {
  genLinux(size);
}

const appOutput = svg2png.sync(SOURCE_BUF, { width: 72, height: 72 });
fs.mkdirpSync(APP_OUTPUT);
fs.writeFileSync(path.join(APP_OUTPUT, 'icon.png'), appOutput);

icongen(SOURCE, OUTPUT, {
  modes: ['ico', 'icns'],
  report: true,
  names: {
    ico: 'icon',
    icns: 'icon'
  }
}).then(results => {
  console.log(results);
});
