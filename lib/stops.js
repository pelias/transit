const fs = require('fs');
const decompress = require('decompress');
const csvParse = require('csv-parse');
const through = require('through2');

const utils = require('./utils');


const LAYER_ID = 'stops';


/** if location_type == 1, this is not a stop but a parent station */
function isStop(rec, _, callback) {
  if(rec.location_type !== '1') {
      this.push(rec);
  }
  callback();
}

/** load a GTFS stops.txt and stream the results into elasticsearch
 *
 *  @see https://developers.google.com/transit/gtfs/reference/stops-file
 *  @returns stream ... file open, csv parse, make Pelias, etc...
 */
function loadGtfsStops(filePath, agencyId) {
    return fs.createReadStream(filePath, 'utf8')
        .pipe(csvParse({
            skip_empty_lines: true,
            columns: true
        }))
        .pipe(through.obj(isStop))
        .pipe(through.obj(function(rec, _, callback) {
            const id = utils.makeTransitId(rec.stop_id, agencyId, LAYER_ID);
            var name = rec.stop_name;
            if(name == null)
                name = rec.stop_desc;
            var p = utils.makePeliasRecord(LAYER_ID, id, name, rec.stop_lat, rec.stop_lon);
            this.push(p);
            callback();
    }));
}


/** unzip stops.txt from a GTFS feed */
function unzipStopsFromGtfs(feedZip, outDir, outFileName) {
    utils.logger.info("unzipping stops.txt from %s (out: %s/%s)", feedZip, outDir, outFileName);

    // if the file path ends in .zip, assume it's a GTFS.zip feed and extract stops.txt
    decompress(feedZip, outDir, {
        filter: file => file.path == 'stops.txt',
        map: file => {
            file.path = outFileName;
            return file;
        }
    }).then(files => {
        utils.logger.info("done unzipping %s", outFileName);
    });
}


module.exports = {
    loadGtfsStops : loadGtfsStops,
    unzipStopsFromGtfs : unzipStopsFromGtfs
};
