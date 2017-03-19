const os = require('os');
const fs = require('fs');
const path = require('path');
const sleep = require('sleep');
const decompress = require('decompress');
const csvParse = require('csv-parse/lib/sync');

const utils = require('./utils');

const LAYER = 'stops';


/** return the records array */
function makeRecord(rec, agencyId) {
    const id = `${rec.stop_id}::${agencyId}`;
    var name = rec.stop_name;
    if(name == null)
        name = rec.stop_desc;
    var retVal = utils.makePeliasRecord(LAYER, id, name, rec.stop_lat, rec.stop_lon);
    return retVal;
}

/** parse stops.txt and return a record */
function stopsTxtFileToRecords(stopsPath, agencyId, doAdminLookup) {

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
        var recArray = [];
        if(csvArray) {
            for(var i = 0; i < csvArray.length; i++) {
                var rec = makeRecord(csvArray[i], agencyId);
                recArray.push(rec);
            }
        }
        console.log(recArray);
    });


    //const lat = record['Geocoded Location'].match(latLonRegex);

}

/** load a stops.txt file and return it as a record */
function loadGtfsStops(filePath, agencyId, doAdminLookup) {
    records = [];
    if(filePath.endsWith(".zip")) {
        const tmp = os.tmpdir();
        decompress(filePath, tmp, {filter: file => file.path == 'stops.txt'}).then(files => {
            var stopsPath = path.join(tmp, 'stops.txt');
            stopsTxtFileToRecords(stopsPath, agencyId, doAdminLookup);
        });
    } else {
        stopsTxtFileToRecords(filePath, agencyId, doAdminLookup);
    }
}

module.exports = {
    loadGtfsStops : loadGtfsStops
};