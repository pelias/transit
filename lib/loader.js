const path = require('path');
const csvParse = require('csv-parse');

const adminLookupStream = require('pelias-wof-admin-lookup');
const model = require('pelias-model');
const dbclient = require('pelias-dbclient');

const utils = require('./utils');
const stops = require('./stops');

var transitConfig;


function setTransitConfig(config) {
    transitConfig = config;
}

function load(rec) {
    var filePath = path.join(transitConfig.datapath, rec.filename);
    if(rec.type == 'stops') {
        stops.loadGtfsStops(filePath, rec.agencyId);
    }
    else
        utils.logger.error("unknown type '{}'".format(rec.type));
}

module.exports = {
    setTransitConfig : setTransitConfig,
    load : load
};
