const os = require('os');
const fs = require('fs');
const path = require('path');
const sleep = require('sleep');

const adminLookupStream = require('pelias-wof-admin-lookup');
const model = require('pelias-model');
const dbclient = require('pelias-dbclient');

const decompress = require('decompress');
const csvParse = require('csv-parse');
const through2 = require('through2');

const utils = require('./utils');

const LAYER = 'stop';

/** if location_type == 1, this is not a stop but a parent station */
function isStop(rec, _, callback) {
  if(rec.location_type !== '1') {
      this.push(rec);
  }
  callback();
}

/** parse GTFS stops.txt and stream the results into elasticsearch */
function stopsTxtFileStream(stopsPath, agencyId) {
    var count = 0;
    fs.createReadStream(stopsPath, 'utf8')
        .pipe(csvParse({
            skip_empty_lines: true,
            columns: true
        }))
        .pipe(through2.obj(isStop))
        .pipe(through2.obj(function(rec, _, callback) {
            const id = `${rec.stop_id}::${agencyId}`;
            var name = rec.stop_name;
            if(name == null)
                name = rec.stop_desc;
            var p = utils.makePeliasRecord(LAYER, id, name, rec.stop_lat, rec.stop_lon);
            this.push(p);
            count++;
            callback();
        }))
        .pipe(adminLookupStream.create())
        .pipe(model.createDocumentMapperStream())
        .pipe(dbclient())
        .on('finish', function() {
            console.log(`added ${count} ${agencyId} stops`);
        });
}

/** load a stops.txt file and return it as a record
 *  NOTE: if we're handed a .zip feed (path ends in .zip), we'll extract stops.txt to system /tmp dir
 */
function loadGtfsStops(filePath, agencyId) {
    // if the file path ends in .zip, assume it's a GTFS.zip feed and extract stops.txt
    if(filePath.endsWith(".zip")) {
        const tmp = os.tmpdir();
        decompress(filePath, tmp, {filter: file => file.path == 'stops.txt'}).then(files => {
            var stopsPath = path.join(tmp, 'stops.txt');
            stopsTxtFileStream(stopsPath, agencyId);
        });
    } else {
        stopsTxtFileStream(filePath, agencyId);
    }
}

module.exports = {
    loadGtfsStops : loadGtfsStops
};