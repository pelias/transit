const os = require('os');
const fs = require('fs');
const path = require('path');
const sleep = require('sleep');
const decompress = require('decompress');
const csvParse = require('csv-parse');

const utils = require('./utils');
const loader = require('./loader');


/** return the records array */
function makeRecord() {
    return records;
}

/** parse stops.txt and return a record */
function stopsTxtFileToRecord(stopsPath, agencyId) {
    utils.logger.info("stops:{0}, agency:{1}".format(stopsPath, agencyId));
    fs.readFile(stopsPath, 'utf8', function (err, data) {
        if (err) {
            utils.logger.error(err);
            return;
        }

        var recs = csvParse(data, {
            skip_empty_lines: true,
            columns: true
        });
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