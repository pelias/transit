const sleep = require('sleep');
const path = require('path');
const utils = require('./utils');
const stops = require('./stops');


var transitConfig;
function setTransitConfig(config) {
    transitConfig = config;
}

function load(rec) {
    var filePath = path.join(transitConfig.datapath, rec.filename);
    if(rec.type == 'stops') {
        stops.loadGtfsStops(filePath, rec.agencyId, transitConfig.adminLookup);
        sleep(200);
    }
    else
        utils.logger.error(`unknown type '${rec.type}'`);
}

module.exports = {
    setTransitConfig : setTransitConfig,
    load : load
};

