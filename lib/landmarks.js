const fs = require('fs');
const decompress = require('decompress');
const csvParse = require('csv-parse');
const through = require('through2');

const utils = require('./utils');

/** load a transit landmark file, ala pr.txt, tc.txt, etc...
 *
 *  @see
 *  @returns stream ... file open, csv parse, make Pelias, etc...
 */
function loadTransitLandmarks(filePath, agencyId, layer) {
    return fs.createReadStream(filePath, 'utf8')
        .pipe(csvParse({
            skip_empty_lines: true,
            columns: true
        }))
        .pipe(through.obj(function(rec, _, callback) {
            const id = `${rec.stop_id}::${agencyId}`;
            var name = rec.stop_name;
            if(name == null)
                name = rec.stop_desc;
            var p = utils.makePeliasRecord(layer, id, name, rec.stop_lat, rec.stop_lon);
            this.push(p);
            callback();
    }));
}

module.exports = {
    loadTransitLandmarks : loadTransitLandmarks
};
