const fs = require('fs');
const decompress = require('decompress');
const csvParse = require('csv-parse');
const through = require('through2');

const utils = require('./utils');


const LAYER_ID = 'stops';


// @todo:
// a) Cherriots has stop_code, but they shouldn't show up ... not public
// b) need to pass config struct around vs. set of base params
// c) might need a 'hasStopIds: true flag in pelias.json
// d) grrrr...


/**
 * if location_type == 1, this is not a stop but a parent station
 *
 */
function isStop(rec, _, callback) {
  if(rec.location_type !== '1') {
      //"not a stop" || "not public" || "???"
      this.push(rec);
  }
  callback();
}


/** load a GTFS stops.txt and stream the results into elasticsearch
 *
 *  @see https://developers.google.com/transit/gtfs/reference/stops-file
 *  @returns stream ... file open, csv parse, make Pelias, etc...
 */
function loadGtfsStops(filePath, agencyId, agencyName, layerId, layerName) {
    return fs.createReadStream(filePath, 'utf8')
        .pipe(csvParse({
            skip_empty_lines: true,
            columns: true
        }))
        .pipe(through.obj(isStop))
        .pipe(through.obj(function(rec, _, callback) {
            const id = utils.makeTransitId(rec.stop_id, agencyId, LAYER_ID);

            // stop name
            var name = rec.stop_name;
            if(name == null)
                name = rec.stop_desc;

            // stop code (alt name) ... appended to name if not in there
            var altName = null;
            if(rec.stop_code && rec.stop_code.length > 0 && rec.stop_code !== "null")
                altName = rec.stop_code;
            if(name) {
                name = name + " (" + agencyName;
                if (layerName)
                    name = name + " " + layerName;
                if (altName && name.indexOf(altName) < 0)
                    name = name + " " + altName;
                name = name + ")";

            }
            else {
                name = agencyName;
                if(layerName)
                    name = name + " " + layerName;
            }

            var doc = utils.makePeliasRecord(LAYER_ID, id, name, rec.stop_lat, rec.stop_lon);

            // set some ES values
            if(rec.stop_code && rec.stop_code.length > 0)
                doc.setName('short', rec.stop_code);
            if(agencyName)
                doc.setName('agency_name', agencyName);
            if(agencyId)
                doc.setName('agency_id', agencyId);
            //doc.addCategory('transit category');

            // TODO: maybe set popularity via the config
            doc.setPopularity(1110111);

            this.push(doc);
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
