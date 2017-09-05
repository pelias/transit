'use strict';
const path = require('path');

const utils = require('./utils');
const stops = require('./stops');


// step 1: get transit configuration from pelias.json ... note potential early process exit
const transitConfig = utils.getTransitConfig();

// step 2: we've got a good transit config, so let's unzip stops.txt files from the feeds
transitConfig.feeds.forEach(function(feed) {
    if(feed.url) {
        if(feed.url.startsWith("http"))
            console.log("download " + feed.url);
        else
            console.log("copy " + feed.url);
    }

    if(feed.layerId === "stops") {
        var zipPath = path.join(transitConfig.datapath, feed.agencyId + ".zip");
        //stops.unzipStopsFromGtfs(zipPath, transitConfig.datapath, feed.filename);
        console.log(zipPath);
    }
});
