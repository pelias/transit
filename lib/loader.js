const fs = require('fs');
const path = require('path');
const combinedStream = require('combined-stream');

const utils = require('./utils');
const stops = require('./stops');
const landmarks = require('./landmarks');
const bikeshare = require('./bikeshare');
const fare = require('./fare');

const model = require('pelias-model');
const dbclient = require('pelias-dbclient');
const adminLookupStream = require('pelias-wof-admin-lookup');


/** load will make sure the data file exists and can be loaded
 *  will return a stream that will open the file, parse it and return a Pelias document stream
 *  @see  https://github.com/trescube/delaware-schools-pelias-importer/blob/master/index.js
 */
function load(filePath, layerId, agencyId, agencyName) {
    var stream = null;
    try {
        // make sure the file exists ... throws exception if not
        var stats = fs.lstatSync(filePath);

        // find the correct feed parser, and return a document stream
        if(layerId === 'stops') {
            stream = stops.loadGtfsStops(filePath, agencyId, agencyName, layerId);
        } else if(layerId === 'landmarks' || layerId === 'intersections') {
            stream = landmarks.loadTransitLandmarks(filePath, agencyId, agencyName, layerId);
        } else if(layerId === 'bikeshare') {
            stream = bikeshare.loadGbfsStations(filePath, agencyId, agencyName, layerId);
        } else if(layerId === 'fare') {
            stream = fare.loadFareOutlets(filePath, agencyId, agencyName, layerId);
        } else {
            utils.logger.error(`unknown type '${layerId}' for file ${filePath}`);
            stream = null;
        }
    } catch(e) {
        utils.logger.error(`error opening file ${filePath}: ${e}`);
        stream = null;
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
        var stream = load(filePath, feed.layerId, feed.agencyId, feed.agencyName);
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
