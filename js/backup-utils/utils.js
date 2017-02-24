'use strict';
//Node Modules
const fs = require('fs');
const mkdirp = require('mkdirp');
const moment = require('moment');
const events = require('./events.js');

//Methods we export
const utils = {
  determineInterface,
  ignoreBuilder,
  initFiles,
  makeFolder,
  writeLogging,
};

let logsPath = '';
let fullFilePath = '';
const dateFormatted = moment().format('YYYY-MM-D');
let logFileName = dateFormatted + '-log.txt';
let fileHeaderMessage = dateFormatted + ' Backup Log File\r\n';
let actuallyDesktop = false;

function determineInterface(isDesktop, initializerCallback) {
  //Affects initFiles, writeLogging
  let settingsFileString = '';
  actuallyDesktop = isDesktop;

  if (isDesktop) {
    logsPath = 'Logs';
    settingsFileString = './js/app-settings.js';
  } else {
    logsPath = '../../Logs';
    settingsFileString = '../app-settings.js';
  }
  fullFilePath = logsPath + '/' + logFileName;
  let settingsFile = fs.readFileSync(settingsFileString, 'utf-8');

  const settingLine = `isDesktop: `;
  const searchRegexString = settingLine + `(false|true)` + `,`;
  const currentSettingString = settingLine + isDesktop + `,`;

  let searchRegex = new RegExp(searchRegexString);
  let updatedDesktopSetting = settingsFile.replace(searchRegex, currentSettingString);

  fs.writeFileSync(settingsFileString, updatedDesktopSetting, 'utf-8');
  if (isDesktop) writeLogging('Desktop environment determined. Changing isDesktop setting to true.');
  else writeLogging('Console environment determined. Changing isDesktop setting to false.');

  initializerCallback();
}

function handleErrors(error, callback) {
  if (error) return writeLogging('There was an error: ' + error, true);
  if (callback) callback();
}

function ignoreBuilder(array) {
  let formattedSearch = array.map((term) => {
    return '(' + term + ')';
  })
  formattedSearch = formattedSearch.join('|');
  return formattedSearch;
};

function initFiles(cb) {
  //Check to see if the file does not exist, if not then create it
  makeFolder(logsPath, () => {
    let fileNotExists = !fs.existsSync(fullFilePath);
    if (fileNotExists) {
      fs.writeFile(fullFilePath, fileHeaderMessage, (err) => { handleErrors(err, cb) });
      writeLogging('Base files does not exist, creating default file' + fullFilePath)
    } else {
      writeLogging('Base file exists, continuing on...')
      if (cb) cb();
    }
  });
}

function makeFolder(folderPath, cb) {
  //Create a folder if none exists.
  fs.access(folderPath, fs.F_OK, (err) => {
    if (err)
      mkdirp(folderPath, (err2) => { handleErrors(err2, cb) });
    else
    if (cb) cb();
  });;
}

function writeLogging(message, isError) {
  //Praise file logging, so useful for debugging too!
  if (isError) console.error(message);
  else{
    if(actuallyDesktop) events.emitMessage(message);
    else console.log(message);
  } 

  //Add a new line for each write in the log file itself
  let timeFormatted = moment().format('HH:mm:ss');
  message = `[${timeFormatted}] ${message} \r\n`;
  fs.appendFile(fullFilePath, message, handleErrors);

}

module.exports = utils;
