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
    return stream;
}

function loadTransitFeeds(transitConfig) {
    utils.logger.info('Importing %s transit feedsArray.', transitConfig.feeds.length);

    var recordStream = combinedStream.create();
    transitConfig.feeds.forEach(function(feed) {
        var filePath = path.join(transitConfig.datapath, feed.filename);
        recordStream.append( function(next) {
            utils.logger.info('Creating read stream for: %s', filePath);
            next(load(filePath, feed.type, feed.agencyId));
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
