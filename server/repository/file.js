'use strict';

const logger = require('../utils/logger'),
  constants = require('../constants'),
  Model = require('../utils/mongoDB').getModel('File');


class File {

  static async removeAll() {
    try {
      await Model.deleteMany();
      logger.log("All files is cleaned at: " + new Date());
      return true;
    } catch (e) {
      logger.error("File:removeAll()", e);
      return false;
    }
  }

  /**
   *
   * @param  {Object}
   * @return {Promise<Boolean>}
   */
  static async create({
    name,
    path = '',
    type,
    deleteAt = null
  }) {

    try {
      //@todo validation
      //@todo ancestor exist
      await Model.create({
        name,
        path,
        type,
        deleteAt
      });
      logger.log("New file is inserted at: " + new Date());
      return true;

    } catch (e) {
      logger.error("File:create()", e);
      return false;
    }
  }

  /**
   *
   * @return {Promise< {Object[]}|null>}
   */
  static async findFile({
    path
  }) {
    try {
      return await Model.find({
        path,
        deleteAt: null
      }).lean();

    } catch (e) {
      logger.error("File:findFile()", e);
      return null;
    }
  }

  //Only folder level, not sub folder.
  static async findFileStartWith({
    startWith,
    path,
    limit = 10
  }) {
    try {
      const pattern = new RegExp('^' + startWith, 'i')
      return await Model.find({
        path,
        type: constants.FILE_TYPE.FILE,
        name: pattern,
        deleteAt: null
      }).limit(limit).lean();

    } catch (e) {
      logger.error("File:findFileStartWith()", e);
      return null;
    }
  }

  //Include sub folders
  static async findFileWithName({
    name,
    path,
    includeSubFolder = false,
    limit = 1000
  }) {
    try {
      const pattern = new RegExp('^' + path, 'i')
      return await Model.find({
        path: includeSubFolder ? pattern : path,
        type: constants.FILE_TYPE.FILE,
        name,
        deleteAt: null
      }).limit(limit).lean();

    } catch (e) {
      logger.error("File:findFileWithName()", e);
      return null;
    }
  }


}

module.exports = File;