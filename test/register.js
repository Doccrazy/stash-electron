const fs = require('fs');
const path = require('path');
const Module = require('module').Module;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const oldResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain) {
  if (!request.startsWith('.') && fs.existsSync(path.join(__dirname, 'mocks', `${request.replace('/', '-')}.js`))) {
    request = path.join(__dirname, 'mocks', request.replace('/', '-'));
  }
  return oldResolveFilename.call(this, request, parent, isMain);
};

global.window = {
  addEventListener: function () {},
  Date: Date
};

global.document = {
  documentElement: {
    style: {}
  },
  createElement: () => null
};
