const utils = require('./utils');

var transitConfig;

function setTransitConfig(config) {
    transitConfig = config;
}

function parse(rec) {
    //stops.parseGtfsStops();
    var filePath = transitConfig.datapath + rec.filename;
    utils.logger.info(filePath);
}

module.exports = {
    parse : parse,
    setTransitConfig : setTransitConfig
};
