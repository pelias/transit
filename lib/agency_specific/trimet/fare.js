const fs = require('fs');
const through = require('through2');
const JSONStream = require('JSONStream');
const utils = require('../../utils');

const SUB_NAME = 'HOP Fastpass';

/** load Portland's HOP (fare card) vendor locations
 *
 *  @see https://developer.trimet.org/ws/v1/retail_outlet?appId=<trimet api id>
 *  @see http://localhost:9200/pelias/_search?pretty=true&q=_type:hop
 *  @returns stream
 */
function loadHopOutlets(filePath, agencyId, agencyName, layerId, subName) {
  return fs.createReadStream(filePath, 'utf8')
      .pipe(JSONStream.parse('results.*'))
      .pipe(through.obj((rec, _, callback) => {
        const id = utils.makeTransitId(rec.id, agencyId, layerId);

        var name = rec.name;
        name = name + ' (' + SUB_NAME + ')';

        var doc = utils.makePeliasRecord(
        layerId, id, name,
        rec.latitude, rec.longitude, null, rec.addressLine1
        );

        // set some ES values
        var altName = agencyName + ' ' + layerId + ' ' + rec.id;
        if(altName){
        doc.setName('alt_name', altName);
        }
        if(agencyName){
        doc.setName('agency_name', agencyName);
        }
        if(agencyId){
        doc.setName('agency_id', agencyId);
        }

        callback(null, doc);
      }));
}

module.exports.loadHopOutlets = loadHopOutlets;
