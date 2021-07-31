'use strict';

const
  isDevMode = process.env.NODE_ENV !== 'production',
  isTestMode = process.env.NODE_ENV === 'test',
  localUri = 'mongodb://localhost:27017/';

const constants = {
  EXPRESS_PORT: Number(process.env.PORT) || 3100,
  FILE_TYPE: {
    FILE: 'file',
    FOLDER: 'folder'
  },
  MONGODB: {
    connections: {
      default: {
        uri: process.env.COFFEE_MONGO_DB_URI || localUri + `truebase${isTestMode ? '_test' : (isDevMode ? '_dev' : '')}`
      }
    }
  },

};

module.exports = constants;
