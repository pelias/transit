const combinedStream = require('combined-stream');
const path = require('path');
const utils = require('./utils');
const stops = require('./stops');


function load(fullPath, dataType, agencyId) {
    if(dataType == 'stops') {
        stops.loadGtfsStops(fullPath, agencyId);
    }
    else
        utils.logger.error(`unknown type '${dataType}'`);
}

function loadTransitFiles(transitConfig) {
    var recordStream = combinedStream.create();

    var files = transitConfig.files;
    files.forEach(function forEach(rec) {
        console.log(rec);
        var fullPath = path.join(transitConfig.datapath, rec.filename);
        load(fullPath, rec.type, rec.agencyId);
    });

    //return recordStream;
}

module.exports = {
    loadTransitFiles : loadTransitFiles
};
/*

function load(rec) {
    var filePath = path.join(transitConfig.datapath, rec.filename);
    if(rec.type == 'stops') {
        stops.loadGtfsStops(filePath, rec.agencyId, transitConfig.adminLookup);
    }
    else
        utils.logger.error(`unknown type '${rec.type}'`);
}
*/