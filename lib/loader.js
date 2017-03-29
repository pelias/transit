const path = require('path');
const combinedStream = require('combined-stream');

const utils = require('./utils');
const stops = require('./stops');

const model = require('pelias-model');
const dbclient = require('pelias-dbclient');
const adminLookupStream = require('pelias-wof-admin-lookup');


function load(fullPath, dataType, agencyId) {
    var stream = null;
    if(dataType == 'stops') {
        stream = stops.loadGtfsStops(fullPath, agencyId);
    } else if(dataType == 'pr') {
        stream = stops.loadGtfsStops(fullPath, agencyId);
    } else {
        utils.logger.error(`unknown type '${dataType}' for file ${fullPath}`);
        stream = null;
    }
    return stream;
}

function loadTransitFeeds(transitConfig) {
    utils.logger.info('Importing %s transit feedsArray.', transitConfig.feeds.length);

    var recordStream = combinedStream.create();
    transitConfig.feeds.forEach(function(feed) {
        var filePath = path.join(transitConfig.datapath, feed.filename);
        var stream = load(filePath, feed.type, feed.agencyId);
        if(stream)
            recordStream.append( function(next) {
                utils.logger.info('Creating read stream for: %s', filePath);
                next(stream);
            });
    });

    recordStream
        .pipe(adminLookupStream.create())
        .pipe(model.createDocumentMapperStream())
        .pipe(dbclient());
}


module.exports = {
    loadTransitFeeds : loadTransitFeeds
};
