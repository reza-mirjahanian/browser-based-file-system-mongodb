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
    path,
    name
  }) {
    try {
      return await Model.findOne({
        path,
        name,
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

  // File or Folder
  static async deleteFile({
    name,
    path,
  }) {
    try {
      const file = await File.findFile({
        name,
        path,
      });
      if (file) {
        const {
          type
        } = file;
        if (type === 'file') {
          await Model.updateOne({
            _id: file._id
          }, {
            $set: {
              deleteAt: new Date()
            }
          });
        }
        if (type === 'folder') { // Remove with sub files (Dangerous)
          const pattern = new RegExp('^' + `${path}${name}/`, 'i');
          await Model.updateOne({
            _id: file._id
          }, {
            $set: {
              deleteAt: new Date()
            }
          });
          await Model.update({
            path: pattern,
            deleteAt: null
          }, {
            $set: {
              deleteAt: new Date()
            }
          }, {
            multi: true
          });
        }
        return true;
      }

      return false;
    } catch (e) {
      logger.error("File:deleteFile()", e);
      return false;
    }
  }


  // Count files
  static async countFiles({
    path,
  }) {
    try {
      const pattern = new RegExp('^' + path, 'i')
      return await Model.aggregate([{
          $match: {
            path: pattern,
            deleteAt: null,
            type: 'file'
          }
        },
        {
          $group: {
            _id: "$path",
            count: {
              $sum: 1
            }
          }
        }
      ]);

    } catch (e) {
      logger.error("File:countFiles()", e);
      return false;
    }
  }

  //@todo we should use commit, rollback
  //@todo not very efficient
  // Rename File or Folder
  static async renameFile({
    name,
    path,
    newName
  }) {
    try {
      const file = await File.findFile({
        name,
        path,
      });

      if (file) {
        const {
          type
        } = file;

        if (type === 'file') {
          return await Model.updateOne({
            _id: file._id
          }, {
            $set: {
              name: newName
            }
          });
        }

        if (type === 'folder') { // Rename with sub files
          const pattern = new RegExp('^' + `${path}${name}/`, 'i');
          await Model.updateOne({
            _id: file._id
          }, {
            $set: {
              name: newName
            }
          });
          await Model.updateMany({
            path: pattern,

          }, [{
            $set: {
              path: {
                $replaceOne: {
                  input: "$path",
                  find: `/${name}/`,
                  replacement: `/${newName}/`
                }
              }
            }
          }]);
        }
        return true;
      }

      return false;
    } catch (e) {
      logger.error("File:renameFile()", e);
      return false;
    }
  }

}

module.exports = File;