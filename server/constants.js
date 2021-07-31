'use strict';

const
  isDevMode = process.env.NODE_ENV !== 'production',
  isTestMode = process.env.NODE_ENV === 'test',
  localUri = 'mongodb://localhost:27017/';

const constants = {
  EXPRESS_PORT: Number(process.env.PORT) || 3100,
  MONGODB: {
    connections: {
      default: {
        uri: process.env.COFFEE_MONGO_DB_URI || localUri + `coffee${isTestMode ? '_test' : (isDevMode ? '_dev' : '')}`
      }
    }
  },

};

module.exports = constants;
