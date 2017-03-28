const combinedStream = require('combined-stream');
const path = require('path');
const utils = require('./utils');
const stops = require('./stops');

const adminLookupStream = require('pelias-wof-admin-lookup');
const model = require('pelias-model');
const dbclient = require('pelias-dbclient');

var RecordStream = require('./streams/RecordStream');




function load(fullPath, dataType, agencyId) {
    var stream = null;
    if(dataType == 'stops') {
        stream = stops.loadGtfsStops(fullPath, agencyId);
    } else {
        utils.logger.error(`unknown type '${dataType}'`);
        stream = null;
    }
}

function loadTransitFiles(transitConfig) {

    var files = transitConfig.files;
    utils.logger.info( 'Importing %s files.', files.length);
    files.forEach(function forEach(rec) {
        var fullPath = path.join(transitConfig.datapath, rec.filename);
        load(fullPath, rec.type, rec.agencyId);
    });

    //return recordStream;
}

function createFullImportPipeline(files, dirPath, adminLookupStream, finalStream) {
  logger.info( 'Importing %s files.', files.length);

  finalStream = finalStream || peliasDbclient();

  RecordStream.create(files, dirPath)
    .pipe(adminLookupStream)
    .pipe(model.createDocumentMapperStream())
    .pipe(finalStream);

    if(stream) {
        stream
            .pipe(adminLookupStream.create())
            .pipe(model.createDocumentMapperStream())
            .pipe(dbclient())
            .on('finish', function () {
                console.log(`finished`);
            });
    }
}

module.exports = {
  create: createFullImportPipeline
};
