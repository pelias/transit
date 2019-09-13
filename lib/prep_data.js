const fs = require('fs');
const path = require('path');
const request = require('sync-request');
const utils = require('./utils');
const stops = require('./stops');
const logger = require( 'pelias-logger' ).get('transit');

const BUF_LENGTH = 64*1024;

// step 1: get transit configuration from pelias.json ... note potential early process exit
const transitConfig = utils.getTransitConfig();
const bkupDir = path.join(transitConfig.datapath, 'backup');

if (!transitConfig.feeds) {
  logger.warn('transit config has no `feed` entries, Transit importer quitting after taking no action');
  process.exit(0);
}

// step 2: make sure (as best as we can) we have a directory to write things into
mkdir(transitConfig.datapath);
mkdir(bkupDir);

// step 3: we've got a good transit config, so let's unzip stops.txt files from the feeds
transitConfig.feeds.forEach(function(feed) {
  var outPath = path.join(transitConfig.datapath, feed.filename);
  var bkupPath = path.join(bkupDir, feed.filename);

  // backup this file...
  var backup = mv(outPath, bkupPath);

  var success = false;
  if(feed.url) {
    if(feed.url.startsWith('http')) {
      success = downloadFile(feed.url, feed.layerId, feed.agencyId, transitConfig.datapath, feed.filename);
    }
    else {
      var filePath = feed.url;  // if not a url, assume a file path (either an explicit or relative path)
      success = cp(filePath, outPath);
    }
  }

  // warn on errors, and if available, revert to a backup version
  if(success === false) {
    console.log('Had an issue obtaining new file ' + outPath);
    if(backup) {
      console.log('I\'m going to revert this file up to an older previous backed-up version');
      cp(outPath, bkupPath);
    }
  }
});


/** this routine will download different file types, and handle necessary motions to get data from that file
  for example: GTFS files will be downloaded, and then stops.txt will be unzipped...
 */
 function downloadFile(url, layerId, agencyId, outDir, outFileName) {
  var retVal = false;
  var outPath = path.join(outDir, outFileName);
  console.log('wget ' + url + ' to ' +  outPath);

  try {
    // option A: handle .zip files
    if(layerId === 'stops') {
      // step 1: paths
      var zipPath = path.join(outDir, agencyId + '.zip');
      var zipBkupPath = path.join(bkupDir, agencyId + '.zip');

      // step 2: backup old file
      mv(zipPath, zipBkupPath);

      // step 3: download
      let stream = request('GET', url);
      fs.writeFileSync(zipPath, stream.getBody());

      // step 4: unzip stops.txt
      stops.unzipStopsFromGtfs(zipPath, outDir, outFileName);
      console.log('unzip stops.txt to ' + outPath);
    }
    // option B: handle simple file downloads
    else {
      let stream = request('GET', url);
      fs.writeFileSync(outPath, stream.getBody());
    }
    retVal = true;
  } catch(e) {
    console.log(e);
    retVal = false;
  }

  return retVal;
}


/**
 * syncronous file copy
 * borrowed from: http://procbits.com/2011/11/15/synchronous-file-copy-in-node-js
 */
function cp(inPath, outPath) {
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


function mkdir(path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
  }
}


function mv(inPath, outPath) {
  var retVal = false;
  if(fs.existsSync(inPath)) {
    fs.renameSync(inPath, outPath);
    retVal = true;
  }
  return retVal;
}
