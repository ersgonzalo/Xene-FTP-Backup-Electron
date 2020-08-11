const fs = require('fs-extra');
const moment = require('moment');
const path = require('path');
const zlib = require('zlib');

// My Modules
const utils = require('./utils.js');
const settings = require('../app-settings.js');

const startTime = moment();
const startTimeString = startTime.format('HH[:]mm[:]ss');
const todayString = startTime.format('YYYY[.]MM[.]DD');
const destinationPath = settings.COPY_PATH.destinationPath;
const extractLogPath = destinationPath + todayString + path.sep + settings.COPY_PATH.folderName;
const baseLogLocation = `${extractLogPath}${path.sep}logs${path.sep}`;

function initLogCopy() {
  fs.readdir(baseLogLocation, (data, files) => {
    files.forEach((file) => {
      const localFile = `${baseLogLocation}${file}`;
      const newLocation = `${extractLogPath}${path.sep}ExtractedLogs${path.sep}`;

      if (localFile.endsWith('.gz')) {
        utils.writeLogging(`[Extracting] ${file} to ${newLocation}`);
        gzExtract(localFile, newLocation, file);
      }
    });
  });
}

function gzExtract(filePath, newPath, fileName) {
  const fileToBeExtracted = fs.createReadStream(filePath);
  const outputPath = newPath + fileName.slice(0, fileName.length - 3);
  const output = fs.createWriteStream(outputPath);

  // Create a folder if none exists.
  utils.makeFolder(newPath);

  fileToBeExtracted.pipe(zlib.Unzip()).pipe(output);
}

module.exports = initLogCopy;
