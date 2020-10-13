const fs = require('fs');
const util = require('util');
const _ = require('lodash');
const decompress = require('decompress');
const csvParse = require('csv-parse');
const through = require('through2');
const utils = require('./utils');

const LAYER_ID = 'stops';

// @todo:
// a) Cherriots has stop_code, but they shouldn't show up ... not public
// b) need to pass config struct around vs. set of base params
// c) might need a 'hasStopIds: true flag in pelias.json
// d) grrrr...

/**
 * determine if this record is a stop we want to insert into Pelias
 */
function isStop(rec, _, callback) {
  var is_stop = true;

  // make sure this is a stop, not a station, etc...
  if(rec.location_type === '1'){
    is_stop = false;
  }

  // look for tags in the stop name
  var n = rec.stop_name;
  if(is_stop && (n.includes('not a stop') || n.includes('not public'))){
    is_stop = false;
  }

  // if we now determine this is a stop, push it onto return stack
  if(is_stop){
    this.push(rec);
  }

  callback();
}

/** load a GTFS stops.txt and stream the results into elasticsearch
 *
 *  @see https://developers.google.com/transit/gtfs/reference/stops-file
 *  @returns stream ... file open, csv parse, make Pelias, etc...
 */
function loadGtfsStops(filePath, agencyId, agencyName, layerId, layerName) {
  return fs.createReadStream(filePath, 'utf8')
    .pipe(csvParse({
      skip_empty_lines: true,
      columns: true,
      relax: true
    }))
    .pipe(through.obj(isStop))
    .pipe(through.obj(generateRecordXform(agencyId, agencyName, layerName)));
}

// generate pelias document
function generateRecordXform(agencyId, agencyName, layerName) {
  return (rec, _, next) => {

    // generate document ID
    const id = utils.makeTransitId(rec.stop_id, agencyId, LAYER_ID);

    // generate the document name
    const name = generateName(rec, agencyName, layerName);

    // create a pelias/model document
    const doc = utils.makePeliasRecord(LAYER_ID, id, name, rec.stop_lat, rec.stop_lon);

    // set some aliases
    if (rec.stop_code && rec.stop_code.length > 0) {
      doc.setNameAlias('default', rec.stop_code);
      doc.setNameAlias('default', util.format('Stop %s', rec.stop_code));
      doc.setNameAlias('default', util.format('%s stop', rec.stop_code));
    }

    next(null, doc);
  };
}

// generate the document name
function generateName(rec, agencyName, layerName){

  // validate args
  if( !_.isPlainObject(rec) ){ return ''; }
  if( !_.isString(agencyName) ){ throw new Error( 'invalid agency name' ); }
  if( _.isEmpty(agencyName) ){ throw new Error( 'invalid agency name' ); }
  if( !_.isString(layerName) ){ layerName = ''; }

  // stop name and alternative name
  var name = '';
  var altname = '';

  // select which field to use for the name
  if( _.isString( rec.stop_name ) && rec.stop_name !== 'null' ) {
    name = rec.stop_name.trim();
  } else if( _.isString( rec.stop_desc ) && rec.stop_desc !== 'null' ) {
    name = rec.stop_desc.trim();
  }

  // stop code (alt name)
  if( _.isString( rec.stop_code ) && rec.stop_code !== 'null' ){
    altname = rec.stop_code.trim();
  }

  // format name
  if( !_.isEmpty( name ) ) {
    var agency = util.format('%s Stop', agencyName);

    // formatting including the altname
    // note: we pad both strings with spaces to enfore 'phrase matching',
    // avoiding substring matches.
    if( !_.isEmpty(altname) && !_.includes(util.format(' %s ', name), util.format(' %s ', altname)) ){
      name = util.format('%s (%s ID %s)', name, agency, altname);

    // without the alt name
    } else {
      name = util.format('%s (%s)', name, agency);
    }
  }

  // no valid name, format a name based off metadata only
  else {
    name = util.format('%s %s', agencyName, layerName).trim();
  }

  return name;
}

/** unzip stops.txt from a GTFS feed */
function unzipStopsFromGtfs(feedZip, outDir, outFileName) {
  utils.logger.info('unzipping stops.txt from %s (out: %s/%s)', feedZip, outDir, outFileName);

  // if the file path ends in .zip, assume it's a GTFS.zip feed and extract stops.txt
  decompress(feedZip, outDir, {
    filter: file => file.path === 'stops.txt',
    map: file => {
      file.path = outFileName;
      return file;
    }
  }).then(files => {
    utils.logger.info('done unzipping %s', outFileName);
  });
}

module.exports = {
  loadGtfsStops : loadGtfsStops,
  unzipStopsFromGtfs : unzipStopsFromGtfs,
  generateName : generateName,
  generateRecordXform : generateRecordXform
};
