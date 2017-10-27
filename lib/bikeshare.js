const fs = require('fs');
const through = require('through2');
const JSONStream = require('JSONStream');
const utils = require('./utils');


const LAYER_ID = 'bikeshare';


/** load a GBFS stations URL, and stream the results into elasticsearch
 *
 *  @see https://github.com/NABSA/gbfs/blob/master/gbfs.md#station_informationjson
 *  @see http://biketownpdx.socialbicycles.com/opendata/station_information.json
 *  @see http://localhost:9200/pelias/_search?pretty=true&q=_type:bikeshare
 *  @returns stream
 */
function loadGbfsStations(filePath, agencyId, agencyName, layerId) {
    return fs.createReadStream(filePath, 'utf8')
        .pipe(JSONStream.parse('data.stations.*'))
        .pipe(through.obj(function(rec, _, callback) {
            const id = utils.makeTransitId(rec.station_id, agencyId, LAYER_ID);

            const removeStrs = [', Portland, Oregon', ', Portland'];
            var address = utils.cleanAddressString(rec.address, removeStrs);
            var altName = agencyName + " " + rec.station_id;

            var doc = utils.makePeliasRecord(LAYER_ID, id, rec.name, rec.lat, rec.lon, null, address);

            // set some ES values
            if(altName)
                doc.setName('alt_name', altName);
            if(agencyName)
                doc.setName('agency_name', agencyName);
            if(agencyId)
                doc.setName('agency_id', agencyId);

            this.push(doc);
            callback();
    }));
}


module.exports = {
    loadGbfsStations : loadGbfsStations
};
