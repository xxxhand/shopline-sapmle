require('dotenv').config()
const superTest = require('supertest');
const { app, tryInitial, tryTerminate } = require('../../app');

/** @type {superTest.SuperAgentTest} */
let _agent;

exports.AgentHelper = class {
  static getInstance = async () => {
    if (!_agent) {
      await tryInitial();
      _agent = superTest.agent(app.callback());
    }
    return _agent;
  }

  static terminate = async () => {
    return tryTerminate();
  }
}
