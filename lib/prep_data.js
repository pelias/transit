'use strict';
const fs = require('fs');
const path = require('path');
//const request = require('sync-request');
const request = require('request');

const utils = require('./utils');
const stops = require('./stops');

const BUF_LENGTH = 64*1024;


// step 1: get transit configuration from pelias.json ... note potential early process exit
const transitConfig = utils.getTransitConfig();

// step 2: we've got a good transit config, so let's unzip stops.txt files from the feeds
transitConfig.feeds.forEach(function(feed) {
    var outPath = path.join(transitConfig.datapath, feed.filename);
    var bkupPath = path.join(transitConfig.datapath, "backup", feed.filename);

    // backup file
    var backup = cpFile(outPath, bkupPath);

    var success = false;
    if(feed.url) {
        if(feed.url.startsWith("http")) {
            success = downloadFile(feed.url, outPath, feed.layerId, transitConfig.datapath, feed.agencyId);
        }
        else {
            var f = feed.url;
            success = cpFile(f, outPath);
        }
    }

    // warn on errors, and if available, revert to a backup version
    if(success == false) {
        console.log("Had an issue obtaining new file " + outPath);
        if(backup) {
            console.log("I'm going to revert this file up to an older previous backed-up version");
            cpFile(outPath, bkupPath);
        }
    }
});


function rmFile(outPath) {
    console.log("rm file " + outPath);
}


/**
 * syncronous file copy
 * borrowed from: http://procbits.com/2011/11/15/synchronous-file-copy-in-node-js
 * @param inPath
 * @param outPath
 * @returns {boolean}
 */
function cpFile(inPath, outPath) {
    var retVal = false;

    if(fs.existsSync(inPath)) {
        var buff = new Buffer(BUF_LENGTH);
        var fdr = fs.openSync(inPath, 'r');
        var fdw = fs.openSync(outPath, 'w');
        var bytesRead = 1;
        var pos = 0;
        while(bytesRead > 0)
        {
            bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
            fs.writeSync(fdw,buff,0,bytesRead);
            pos += bytesRead;
        }
        fs.closeSync(fdr);
        fs.closeSync(fdw);

        retVal = true;
    }
    return retVal;
}


function downloadFile(url, outPath, layerId, tmpPath, agencyId) {
    var retVal = true;
    console.log("wget " + url + " to " + outPath);

    if(layerId === "stops") {
        //var stream = request('GET', url);
        var stream = request(url);
        var zipPath = path.join(tmpPath, agencyId + ".zip");
        var writeStream = fs.createWriteStream(zipPath);
        stream.pipe(writeStream);
        //stops.unzipStopsFromGtfs(zipPath, transitConfig.datapath, feed.filename);
        console.log("unzip stops.txt to " + outPath);
    }

    retVal = true;
    return retVal;
}


