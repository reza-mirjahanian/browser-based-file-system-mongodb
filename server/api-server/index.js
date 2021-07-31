'use strict';
const express = require('express'),
  constants = require('../constants'),
  fileRepo = require('../repository/file'),

  cors = require('cors'),
  logger = require('../utils/logger');

const app = express();
app.use(express.json());
app.use(cors());

// main page
app.get('/', (req, res) => res.send('Server is running'));


app.post('/crete-file', async (req, res) => {
  try {
    const {
      path,
      parent,
      name,
      type
    } = req.body;

    await fileRepo.create({
      path,
      parent,
      name,
      type
    });

    return res.status(200).send('OK');
  } catch (err) {
    logger.error(req.path, {
      err
    });
    res.status(500).send("Error");
  }
});

app.post('/find-file-start-with', async (req, res) => {
  try {
    const {
      path,
      startWith
    } = req.body;

    const files = await fileRepo.findFileStartWith({
      path,
      startWith,
    });
    return res.status(200).send(files);
  } catch (err) {
    logger.error(req.path, {
      err
    });
    res.status(500).send("Error");
  }
});

app.post('/find-file-with-name', async (req, res) => {
  try {
    const {
      path,
      name,
      includeSubFolder
    } = req.body;

    const files = await fileRepo.findFileWithName({
      path,
      name,
      includeSubFolder
    });
    return res.status(200).send(files);
  } catch (err) {
    logger.error(req.path, {
      err
    });
    res.status(500).send("Error");
  }
});

app.listen(constants.EXPRESS_PORT, () => logger.log(`listening on port ${constants.EXPRESS_PORT}!`));
