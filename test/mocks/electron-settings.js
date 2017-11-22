const { stub } = require('sinon');

module.exports = {
  set: stub(),
  setAll: stub(),
  getAll: stub().returns({})
};
