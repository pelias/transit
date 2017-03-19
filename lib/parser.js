const utils = require('./utils');
const stops = require('./stops');

var transitConfig;


function setTransitConfig(config) {
    transitConfig = config;
}

function parse(rec) {
    var filePath = "{0}{1}".format(transitConfig.datapath, rec.filename);
    if(rec.type == 'stops') {
        stops.parseGtfsStops(filePath, transitConfig.agencyId);
    }
    else
        utils.logger.error("unknown type '{}'".format(rec.type));
}

module.exports = {
    parse : parse,
    setTransitConfig : setTransitConfig
};
