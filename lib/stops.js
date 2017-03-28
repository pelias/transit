const os = require('os');
const fs = require('fs');
const path = require('path');
const decompress = require('decompress');
const csvParse = require('csv-parse');
const through2 = require('through2');

const utils = require('./utils');

const LAYER = 'stops';


/** if location_type == 1, this is not a stop but a parent station */
function isStop(rec, _, callback) {
  if(rec.location_type !== '1') {
      this.push(rec);
  }
  callback();
}

/** load a GTFS stops.txt and stream the results into elasticsearch
 *  @see https://developers.google.com/transit/gtfs/reference/stops-file
 *  @returns stream
 *  NOTE: if we're handed a .zip feed (path ends in .zip), we'll extract stops.txt to system /tmp dir
 */
function loadGtfsStops(filePath, agencyId) {
    return fs.createReadStream(filePath, 'utf8')
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
            callback();
    }));
}

module.exports = {
    loadGtfsStops : loadGtfsStops
};

/*
    // if the file path ends in .zip, assume it's a GTFS.zip feed and extract stops.txt
    if(filePath.endsWith(".zip")) {
        const tmp = os.tmpdir();
        const stopsPath = path.join(tmp, `${agencyId}-stops.txt`);
        utils.logger.info(`parsing ${stopsPath}`);
        decompress(filePath, tmp, {
              filter: file => file.path == 'stops.txt',
              map: file => {
                  file.path = `${agencyId}-${file.path}`;
                  return file;
              }
            }).then(files => {
                stopsTxtFileStream(stopsPath, agencyId);
        });
    }
 */
