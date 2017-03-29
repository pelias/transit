'use strict';
const path = require('path');

const schema = require('../schema');
const utils = require('./utils');
const stops = require('./stops');

// step 1: get transit configuration from pelias.json ... note potential early process exit
const transitConfig = utils.getTransitConfig();

// step 2: we've got a good transit config, so let's unzip stops.txt files from the feeds
transitConfig.feeds.forEach(function(feed) {
    if(feed.type === "stops") {
        var zipPath = path.join(transitConfig.datapath, feed.agencyId + ".zip");
        stops.unzipStopsFromGtfs(zipPath, transitConfig.datapath, feed.filename);
    }
});