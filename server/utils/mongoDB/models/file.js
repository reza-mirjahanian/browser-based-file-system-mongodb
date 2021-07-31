'use strict';

const
  Schema = require('mongoose').Schema,
  Models = require('./models');

class File extends Models {
  static schema() {
    return new Schema({
      //@todo create text index
      name: {
        type: String,
        required: true,
        index: true
      },
      path: {
        type: String,
        default: [],
        index: 'text'
      },
      type: {
        type: String,
        enum: ['file', 'folder'],
        default: 'file'
      },
      deleteAt: {
        type: Date,
        default: null,
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
