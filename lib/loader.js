const combinedStream = require('combined-stream');
const path = require('path');
const utils = require('./utils');
const stops = require('./stops');

const adminLookupStream = require('pelias-wof-admin-lookup');
const model = require('pelias-model');
const dbclient = require('pelias-dbclient');


function load(fullPath, dataType, agencyId) {
    var stream = null;
    if(dataType == 'stops') {
        stream = stops.loadGtfsStops(fullPath, agencyId);
    } else {
        utils.logger.error(`unknown type '${dataType}'`);
        stream = null;
    }

    if(stream) {
        stream
            .pipe(adminLookupStream.create())
            .pipe(model.createDocumentMapperStream())
            .pipe(dbclient())
            .on('finish', function () {
                console.log(`added ${agencyId}'s ${dataType} data`);
            });
    }
}

function loadTransitFiles(transitConfig) {
    var recordStream = combinedStream.create();

    var files = transitConfig.files;
    files.forEach(function forEach(rec) {
        var fullPath = path.join(transitConfig.datapath, rec.filename);
        load(fullPath, rec.type, rec.agencyId);
    });

    //return recordStream;
}

module.exports = {
    loadTransitFiles : loadTransitFiles
};
