'use strict';
const expect = require('chai').expect;
require('../../server/api-server'); //@todo maybe cleanup

const constants = require('../../server/constants');
const fileRepo = require('../../server/repository/file');
const axios = require('axios');
const _ = require('lodash');

const SERVER_URL = `http://localhost:${constants.EXPRESS_PORT}/`;
const _insertMockData = async () => {
  await fileRepo.create({
    name: '/',
    path: null,
    type: constants.FILE_TYPE.FOLDER
  });
  await fileRepo.create({
    name: 'Books',
    path: '/',
    type: constants.FILE_TYPE.FOLDER
  });
  await fileRepo.create({
    name: 'NodeJS.pdf',
    path: '/',
    type: constants.FILE_TYPE.FILE
  });
  await fileRepo.create({
    name: 'Programming',
    path: '/Books/',
    type: constants.FILE_TYPE.FOLDER
  });
  await fileRepo.create({
    name: 'NodeJS.pdf',
    path: '/Books/Programming/',
    type: constants.FILE_TYPE.FILE
  });
  await fileRepo.create({
    name: 'NodeJS Testing.pdf',
    path: '/Books/Programming/',
    type: constants.FILE_TYPE.FILE
  });
  await fileRepo.create({
    name: 'NodeJS Testing.pdf',
    path: '/Books/Programming/',
    type: constants.FILE_TYPE.FILE,
    deleteAt: new Date()
  });
  await fileRepo.create({
    name: 'Typescript.js',
    path: '/Books/Programming/',
    type: constants.FILE_TYPE.FILE
  });
  await fileRepo.create({
    name: 'Old',
    path: '/Books/Programming/',
    type: constants.FILE_TYPE.FOLDER
  });
  await fileRepo.create({
    name: 'NodeJS.pdf',
    path: '/Books/Programming/Old/',
    type: constants.FILE_TYPE.FILE
  });

};
suite('Testing Express API routes', () => {
  setup(async () => {
    await fileRepo.removeAll();
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
        name: '/',
        path: null,
        type: constants.FILE_TYPE.FOLDER
      });
      expect(response).to.be.equal('OK');

      await axios.post(SERVER_URL + 'crete-file', {
        name: 'Programming',
        path: '/',
        type: constants.FILE_TYPE.FOLDER
      });

      await axios.post(SERVER_URL + 'crete-file', {
        name: 'NodeJS.pdf',
        path: '/Programming/',
        type: constants.FILE_TYPE.FILE
      });

      const file = await fileRepo.findFile({
        path: '/Programming/',
        name: 'NodeJS.pdf',
      });
      expect(file.name).to.be.equal('NodeJS.pdf');
      expect(file.type).to.be.equal('file');
      expect(file).to.have.all.keys('createdAt', 'updatedAt', 'deleteAt', 'name', 'type', 'path', '_id', '__v');
    });
  });

  suite('POST /find-file-start-with', () => {
    test('should return the top 10 files with names that start with a search string within a folder', async () => {
      await _insertMockData();
      const startWith = 'Nod';
      const {
        data: files
      } = await axios.post(SERVER_URL + `find-file-start-with`, {
        path: '/Books/Programming/',
        startWith,
      });
      expect(files).to.be.an('array').have.lengthOf(2);
      expect(_.map(files, 'name')).to.have.members(['NodeJS Testing.pdf', 'NodeJS.pdf']);
    });
  });

  suite('POST /find-file-with-name', () => {
    test('should search files by their exact name within a parent folder or across all files', async () => {
      await _insertMockData();
      const name = 'NodeJS.pdf';
      const {
        data: files
      } = await axios.post(SERVER_URL + `find-file-with-name`, {
        path: '/Books/Programming/',
        name,
      });
      expect(files).to.be.an('array').have.lengthOf(1);
      expect(_.map(files, 'name')).to.be.deep.equal(['NodeJS.pdf']);

      //Test search in sub folders
      const {
        data: files2
      } = await axios.post(SERVER_URL + `find-file-with-name`, {
        path: '/',
        name,
        includeSubFolder: true
      });
      expect(files2).to.be.an('array').have.lengthOf(3);
      expect(_.map(files2, 'path')).to.have.members(['/', '/Books/Programming/', '/Books/Programming/Old/']);
    });
  });

  suite('POST /delete-file', () => {
    test('should Delete folders and files', async () => {
      await _insertMockData();

      const {
        data
      } = await axios.post(SERVER_URL + 'delete-file', {
        path: '/Books/Programming/',
        name: 'NodeJS.pdf',
      });

      expect(data).to.be.equal(true);
      const file = await fileRepo.findFile({
        path: '/Books/Programming/',
        name: 'NodeJS.pdf',
      });
      expect(file).to.be.equal(null);

      // Test sub folders
      await axios.post(SERVER_URL + 'delete-file', {
        path: '/Books/',
        name: 'Programming',
      });

      const files = await fileRepo.findFileWithName({
        path: '/Books/',
        name: 'Programming',
        includeSubFolder: true
      });
      expect(files).to.be.an('array').have.lengthOf(0);

    });
  });

  suite('POST /count-files', () => {
    test('List folders to include the counts of files in each folder and its sub-folders', async () => {
      await _insertMockData();

      const {
        data
      } = await axios.post(SERVER_URL + 'count-files', {
        path: '/Books/',
      });
      const count1 = _.find(data, {
        count: 1
      });
      expect(count1._id).to.be.equal("/Books/Programming/Old/");

      const count3 = _.find(data, {
        count: 3
      });
      expect(count3._id).to.be.equal("/Books/Programming/");


    });
  });
});