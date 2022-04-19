const { stub } = require('sinon');

module.exports = {
  configure: stub(),
  setSync: stub(),
  getSync: stub().returns({})
};
