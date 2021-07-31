'use strict';

const
  Schema = require('mongoose').Schema,
  Models = require('./models');

class File extends Models {
  static schema() {
    return new Schema({
      name: {
        type: String,
        required: true,
        index: true
      },
      ancestors: {
        type: Array,
        default: [],
        index: true
      },
      parent: {
        type: String,
        //@todo check for: index: true
      },
      type: {
        type: String,
        enum: ['file', 'folder'],
        default: 'file'
      },
      deleteAt: {
        type: Date,
        index: true
      }

    }, {
      timestamps: true
    });
  }

  static collectionName() {
    return 'file';
  }

  static connection() {
    return 'default';
  }
}

module.exports = File;
