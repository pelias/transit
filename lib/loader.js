const fs = require('fs');
const path = require('path');
const combinedStream = require('combined-stream');

const utils = require('./utils');
const stops = require('./stops');

const model = require('pelias-model');
const dbclient = require('pelias-dbclient');
const adminLookupStream = require('pelias-wof-admin-lookup');


/** load will make sure the data file exists and can be loaded
 *  will return a stream that will open the file, parse it and return a Pelias document stream
 */
function load(fullPath, dataType, agencyId) {
    var stream = null;
    try {
        // make sure the file exists ... throws exception if not
        var stats = fs.lstatSync(fullPath);

        // find the correct feed parser, and return a document stream
        if(dataType == 'stops') {
            stream = stops.loadGtfsStops(fullPath, agencyId);
        } else if(dataType == 'pr') {
            stream = stops.loadGtfsStops(fullPath, agencyId);
        } else {
            utils.logger.error(`unknown type '${dataType}' for file ${fullPath}`);
            stream = null;
        }
    } catch(e) {
        utils.logger.error(`error opening file ${fullPath}: ${e}`);
    }
    return stream;
}

/** loop thru the configured feeds and stream them into elasticsearch, based on the Pelias document model */
function loadTransitFeeds(transitConfig) {
    utils.logger.info('Importing %s transit feedsArray.', transitConfig.feeds.length);
    utils.startTiming();

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
