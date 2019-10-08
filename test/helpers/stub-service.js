const { before, after } = require('mocha');
const axios = require('axios');
const sinon = require('sinon');
const BaseService = require('../../app/models/services/base-service');
const services = require('../../app/models/services');

/**
 * Service implementation used for stubbing invocations for tests
 *
 * @class StubService
 * @extends {BaseService}
 */
class StubService extends BaseService {
  /**
   * Creates an instance of StubService.
   *
   * @param {DataOperation} operation The data operation being requested of the service
   * @param {object} callbackOptions The axios options to be used for the callback (merged with
   *   request method and URL)
   * @memberof StubService
   */
  constructor(operation, callbackOptions) {
    super({}, operation);
    this.callbackOptions = callbackOptions;
  }

  /**
   * Asynchronously POSTs to the operation's callback using the callback options provided to the
   * constructor set by the constructor
   *
   * @memberof StubService
   * @returns {void}
   */
  async _invokeAsync() {
    await axios({
      method: 'post',
      url: `${this.operation.callback}/response`,
      ...this.callbackOptions,
    });
  }

  /**
   * Adds before / after hooks in mocha to inject an instance of StubService
   * into service invocations within the current context.  Sets context.service
   * to the most recently created stub service.
   *
   * @static
   * @param {object} callbackOptions The axios options to be used for the callback (merged with
   *   request method and URL)
   * @returns {void}
   * @memberof StubService
   */
  static hook(callbackOptions) {
    before(function () {
      const ctx = this;
      sinon.stub(services, 'forName')
        .callsFake((name, operation) => {
          ctx.service = new StubService(operation, callbackOptions);
          return ctx.service;
        });
      sinon.stub(services, 'forOperation')
        .callsFake((operation) => {
          ctx.service = new StubService(operation, callbackOptions);
          return ctx.service;
        });
    });
    after(function () {
      if (services.forName.restore) services.forName.restore();
      if (services.forOperation.restore) services.forOperation.restore();
      delete this.service;
    });
  }
}

module.exports = StubService;
