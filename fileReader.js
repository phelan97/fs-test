
const {PROBLEM_LIST, PROBLEM_DATA} = require('./config');

const {promisify} = require('util');
const fs = require('fs');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// TODO
// async might actually be a terrible idea here...
// no idea what would happen if this was called from two places
// at the same time and idk if there's a lock

// TODO
// expects PROBLEM_DATA to exist right now.
// fix with fs.stat?

// Fills in new problems from the problem list. If an
// entry is new it'll be set from the last day already saved
const loadProblemList = function() {
  let urlsToAdd;

  readFileAsync(PROBLEM_LIST, 'utf8')
    .then(contents => {
      urlsToAdd = new Set(contents.split(/\r?\n/));

      return readFileAsync(PROBLEM_DATA);
    })
    .then(contents => {
      let strData = contents.toString();
      // check for empty file
      if(!strData) {
        strData = '[]';
      }

      const currentEntries = JSON.parse(strData);
      console.log(currentEntries);
      // Anything that already exists in that data file shouldn't be added
      currentEntries.forEach(entry => {
        if(urlsToAdd.has(entry.url)) {
          urlsToAdd.delete(entry.url);
        }
      });
      
      // set date to the last entry (or today) and then keep updating to the next day
      let date;
      if(currentEntries.length > 0) {
        const lastEntry = currentEntries[currentEntries.length - 1];
        date = new Date(lastEntry.date);
      } else {
        const today = new Date(Date.now());
        date = new Date(today.setHours(10, 0, 0, 0));
      }

      // build json data out
      for(let url of urlsToAdd) {
        // increment date by a day
        date.setDate(date.getDate()+1);

        currentEntries.push({
          url,
          timestamp: date.getTime()
        });
      }

      console.log('Writing ' + urlsToAdd.size + ' new entries');
      return writeFileAsync(PROBLEM_DATA, JSON.stringify(currentEntries, '\n', 1));
    })
    // .then()
    .catch(err => console.log(err)); // just log the error for now
};

module.exports = loadProblemList;
