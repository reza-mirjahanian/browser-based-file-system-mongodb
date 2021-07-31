'use strict';
const expect = require('chai').expect;
require('../../server/api-server'); //@todo maybe cleanup

const constants = require('../../server/constants');
const fileRepo = require('../../server/repository/file');
const axios = require('axios');

const SERVER_URL = `http://localhost:${constants.EXPRESS_PORT}/`;

suite('Testing Express API routes', () => {
  setup(async () => {
    await fileRepo.removeAll();
    // await orderRepo.removeAll();
  });
  suite('GET /', () => {
    test('should respond with "Server is running" ', async () => {
      const {
        data: response
      } = await axios.get(SERVER_URL);
      expect(response).to.equal("Server is running")
    });
  });


  suite('POST /crete-file', () => {
    test('should create file correctly', async () => {

      const {
        data: response
      } = await axios.post(SERVER_URL + 'crete-file', {
        name: 'Books',
        parent: null,
        ancestors: [],
        type: constants.FILE_TYPE.FOLDER
      });
      expect(response).to.be.equal('OK');

      await axios.post(SERVER_URL + 'crete-file', {
        name: 'Programming',
        parent: 'Books',
        ancestors: ['Books'],
        type: constants.FILE_TYPE.FOLDER
      });

      await axios.post(SERVER_URL + 'crete-file', {
        name: 'NodeJS.pdf',
        parent: 'Programming',
        ancestors: ['Books', 'Programming'],
        type: constants.FILE_TYPE.FILE
      });

      const result = await fileRepo.findFile({
        ancestors: ['Books', 'Programming']
      });

      const file = result[0];
      expect(result).to.be.an('array').have.lengthOf(1);
      expect(file.name).to.be.equal('NodeJS.pdf');
      expect(file.type).to.be.equal('file');
      expect(file.parent).to.be.equal('Programming');
      expect(file).to.have.all.keys('createdAt', 'updatedAt', 'name', 'type', 'parent', 'ancestors', '_id', '__v');
    });
  });


});