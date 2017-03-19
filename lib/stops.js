const os = require('os');
const fs = require('fs');
const path = require('path');
const sleep = require('sleep');
const decompress = require('decompress');
const csvParse = require('csv-parse');

const utils = require('./utils');
const loader = require('./loader');


/** return the records array */
var recs = [];
function makeRecord(rec) {
    recs.push(rec);
}

/** parse stops.txt and return a record */
function stopsTxtFileToRecord(stopsPath, agencyId) {

    // step 1: open stops.txt
    fs.readFile(stopsPath, 'utf8', function (err, data) {
        if (err) {
            utils.logger.error(err);
            return;
        }

        // step 2: parse the csv data from stops.txt
        var csvArray = csvParse(data, {
            skip_empty_lines: true,
            columns: true
        });

        // step 3: create Pelias/ES records for each .csv record
        recs = [];
        if(csvArray)
        csvArray.forEach(makeRecord);
        console.log(recs);
    });


    //const lat = record['Geocoded Location'].match(latLonRegex);

}

/** load a stops.txt file and return it as a record */
function loadGtfsStops(filePath, agencyId) {
    records = [];
    if(filePath.endsWith(".zip")) {
        const tmp = os.tmpdir();
        decompress(filePath, tmp, {filter: file => file.path == 'stops.txt'}).then(files => {
            var stopsPath = path.join(tmp, 'stops.txt');
            stopsTxtFileToRecord(stopsPath, agencyId);
        });
    } else {
        stopsTxtFileToRecord(filePath, agencyId);
    }
}

module.exports = {
    loadGtfsStops : loadGtfsStops
};