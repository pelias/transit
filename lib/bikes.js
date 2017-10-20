const fs = require('fs');
const through = require('through2');

const utils = require('./utils');


const LAYER_ID = 'bikeshare';


/** load a GBFS stations URL, and stream the results into elasticsearch
 *
 *  @see https://github.com/NABSA/gbfs/blob/master/gbfs.md#station_informationjson
 *  @returns stream
 */
function loadGbfsStations(filePath, agencyId, agencyName, layerId) {
    return fs.createReadStream(filePath, 'utf8')
        .pipe(csvParse({
            skip_empty_lines: true,
            columns: true
        }))
        .pipe(through.obj(function(rec, _, callback) {
            const id = utils.makeTransitId(rec.stop_id, agencyId, LAYER_ID);

            // stop name
            var name = rec.stop_name;
            if(name == null)
                name = rec.stop_desc;

            // stop code (alt name) ... appended to name if not in there
            var altName = null;
            if(rec.stop_code && rec.stop_code.length > 0)
                altName = rec.stop_code
            if(name.indexOf(altName) < 0)
                name = name + " (Stop ID " + altName + ")";

            var doc = utils.makePeliasRecord(LAYER_ID, id, name, rec.stop_lat, rec.stop_lon);

            // set some ES values
            if(rec.stop_code && rec.stop_code.length > 0)
                doc.setName('short', rec.stop_code);
            if(agencyName)
                doc.setName('agency_name', agencyName);
            if(agencyId)
                doc.setName('agency_id', agencyName);
            //doc.addCategory('transit category');

            // TODO: maybe set popularity via the config
            doc.setPopularity(1110111);

            this.push(doc);
            callback();
    }));
}


module.exports = {
    loadGbfsStations : loadGbfsStations
};
