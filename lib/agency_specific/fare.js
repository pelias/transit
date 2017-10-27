const fs = require('fs');
const through = require('through2');
const JSONStream = require('JSONStream');
const utils = require('../utils');


const LAYER_ID = 'fare';


/** load Portland's HOP (fare card) vendor locations
 *
 *  @see https://developer.trimet.org/ws/v1/retail_outlet?appId=<trimet api id>
 *  @see http://localhost:9200/pelias/_search?pretty=true&q=_type:hop
 *  @returns stream
 */
function loadHopOutlets(filePath, agencyId, agencyName, layerId) {
    return fs.createReadStream(filePath, 'utf8')
        .pipe(JSONStream.parse('results'))
        .pipe(through.obj(function(rec, _, callback) {
            const id = utils.makeTransitId(rec.id, agencyId, LAYER_ID);
            var doc = utils.makePeliasRecord(LAYER_ID, id, rec.name, rec.latitude, rec.longitude, null, rec.addressLine1);

            // set some ES values
            var altName = LAYER_ID + " " + agencyName + " " + rec.id;
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
