'use strict';
const fs = require('fs');
const path = require('path');
const request = require('sync-request');
//const request = require('request');

const utils = require('./utils');
const stops = require('./stops');

const BUF_LENGTH = 64*1024;


// step 1: get transit configuration from pelias.json ... note potential early process exit
const transitConfig = utils.getTransitConfig();
const bkupDir = path.join(transitConfig.datapath, "backup");

// step 2: make sure (as best as we can) we have a directory to write things into
mkdir(transitConfig.datapath);
mkdir(bkupDir);

// step 3: we've got a good transit config, so let's unzip stops.txt files from the feeds
transitConfig.feeds.forEach(function(feed) {
    var outPath = path.join(transitConfig.datapath, feed.filename);
    var bkupPath = path.join(bkupDir, feed.filename);

    // backup this file...
    var backup = cpFile(outPath, bkupPath);

    var success = false;
    if(feed.url) {
        if(feed.url.startsWith("http")) {
            success = downloadFile(feed.url, feed.layerId, feed.agencyId, transitConfig.datapath, feed.filename);
        }
        else {
            var filePath = feed.url;  // if not a url, assume a file path (either explicit or relative path)
            success = cpFile(filePath, outPath);
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

function mkdir(path) {
    try {
        fs.mkdirSync(path);
    } catch(e) {
    }
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
            fs.writeSync(fdw, buff, 0, bytesRead);
            pos += bytesRead;
        }
        fs.closeSync(fdr);
        fs.closeSync(fdw);

        retVal = true;
    }
    return retVal;
}


function downloadFile(url, layerId, agencyId, outDir, outFileName) {
    var retVal = false;
    var outPath = path.join(outDir, outFileName);
    console.log("wget " + url + " to " +  outPath);

    try {
        if(layerId === "stops") {
            var stream = request('GET', url);
            var zipPath = path.join(outDir, agencyId + ".zip");
            fs.writeFileSync(zipPath, stream.getBody());
            stops.unzipStopsFromGtfs(zipPath, outDir, outFileName);
            console.log("unzip stops.txt to " + outPath);
        }
        retVal = true;
    } catch(e) {
        console.log(e);
    }

    return retVal;
}


