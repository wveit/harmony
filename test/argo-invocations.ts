import { expect } from 'chai';
import { stub, SinonStub } from 'sinon';
import { describe, it, before, after } from 'mocha';
import * as axios from 'axios';
import fs from 'fs';

import hookServersStartStop from './helpers/servers';
import { hookRangesetRequest } from './helpers/ogc-api-coverages';
import { objectStoreForProtocol } from '../app/util/object-store';
import env from '../app/util/env';

describe('Argo invocations', function () {
  const collection = 'C1096-PVC_TS2'; // Chaining example
  const version = '1.0.0';

  hookServersStartStop();

  describe('calling a service that has an Argo backend', function () {
    describe('calling the backend service', function () {
      let post;
      let get;
      before(function () {
        const postStub = axios.default.post as SinonStub;
        if (postStub.restore) postStub.restore();
        post = stub(axios.default, 'post');
        get = stub(env, 'queryCmrImagePullPolicy').get(() => 'FOO');
      });

      after(function () {
        if (post.restore) post.restore();
        if (get.restore) get.restore();
      });

      hookRangesetRequest(version, collection, 'all');

      it('passes CMR query locations to the Query CMR task', async function () {
        const [, body] = post.args[0];
        const template = body.workflow.spec.arguments.parameters.find((t) => t.name === 'query');
        const query = template.value;
        expect(query).to.match(/^s3:\/\//);
        const store = objectStoreForProtocol(query);
        const queryFile = await store.downloadFile(query);

        const cmrQuery = fs.readFileSync(queryFile, 'utf8');
        expect(cmrQuery).to.equal('{}');
      });

      it('passes no granules to the Query CMR input', function () {
        const [, body] = post.args[0];
        const template = body.workflow.spec.arguments.parameters.find((t) => t.name === 'operation');
        const operation = template.value;
        const message = JSON.parse(operation);
        const source = message.sources[0];
        expect(source.collection).to.equal('C1096-PVC_TS2');
        expect(source.granules).to.be.undefined;
      });

      it('passes query-cmr-image-pull-policy to the Argo workflow', async function () {
        const [, body] = post.args[0];
        const template = body.workflow.spec.arguments.parameters.find((t) => t.name === 'query-cmr-image-pull-policy');
        const policy = template.value;
        expect(policy).to.equal('FOO');
      });
    });
  });
});
