const path = require('path');

const adminLookupStream = require('pelias-wof-admin-lookup');
const dbclient = require('pelias-dbclient');

const utils = require('./utils');
const stops = require('./stops');


var transitConfig;
function setTransitConfig(config) {
    transitConfig = config;
}

function load(rec) {
    var filePath = path.join(transitConfig.datapath, rec.filename);
    if(rec.type == 'stdps') {
        stops.loadGtfsStops(filePath, rec.agencyId, transitConfig.adminLookup);
    }
    else
        utils.logger.error(`unknown type '${rec.type}'`);
}

module.exports = {
    setTransitConfig : setTransitConfig,
    load : load
};
