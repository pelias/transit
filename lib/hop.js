const fs = require('fs');
const through = require('through2');
const JSONStream = require('JSONStream');
const utils = require('./utils');


const LAYER_ID = 'hop';


/** load Portland's HOP (fare card) vendor locations
 *
 *  @see https://developer.trimet.org/ws/v1/retail_outlet?appId
 *  @see http://localhost:9200/pelias/_search?pretty=true&q=_type:hop
 *  @returns stream
 */
function loadHopOutlets(filePath, agencyId, agencyName, layerId) {
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
                doc.setName('agency_id', agencyName);

            // TODO: maybe set popularity via the config
            doc.setPopularity(1110111);

            this.push(doc);
            callback();
    }));
}


module.exports = {
    loadHopOutlets : loadHopOutlets
};
