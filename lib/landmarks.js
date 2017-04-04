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
function loadTransitLandmarks(filePath, agencyId, agencyName, layerId) {
    return fs.createReadStream(filePath, 'utf8')
        .pipe(csvParse({
            skip_empty_lines: true,
            columns: true
        }))
        .pipe(through.obj(function(rec, _, callback) {
            const id = utils.makeTransitId(rec.id, agencyId, rec.layer_id);
            // todo: break address into number and street ... also mv 222-333 to just 222 (or something)
            var num = null;
            var address = rec.address;
            var p = utils.makePeliasRecord(rec.layer_id, id, rec.name, rec.lat, rec.lon, num, address);
            this.push(p);
            callback();
    }));
}

module.exports = {
    loadTransitLandmarks : loadTransitLandmarks
};
