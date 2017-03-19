const path = require('path');

const adminLookupStream = require('pelias-wof-admin-lookup');
const dbclient = require('pelias-dbclient');

const utils = require('./utils');
const stops = require('./stops');


var transitConfig;
function setTransitConfig(config) {
    transitConfig = config;
}

function load(rec) {
    var filePath = path.join(transitConfig.datapath, rec.filename);
    if(rec.type == 'stdps') {
        stops.loadGtfsStops(filePath, rec.agencyId, transitConfig.adminLookup);
    }
    else
        utils.logger.error(`unknown type '${rec.type}'`);
}

module.exports = {
    setTransitConfig : setTransitConfig,
    load : load
};



/*
const through2 = require('through2');
const request = require('request');

request('https://data.delaware.gov/api/views/wky5-77bt/rows.csv?accessType=DOWNLOAD')
  .pipe(csvParse({
    skip_empty_lines: true,
    columns: true
  }))
  .pipe(through2.obj(is2016))
  .pipe(through2.obj(extractLatLon))
  .pipe(through2.obj(parseAddress))
  .pipe(through2.obj(createDocument))
  // .pipe(adminLookupStream.create())
  .pipe(model.createDocumentMapperStream())
  .pipe(dbclient())
  .on('finish', function() {
    console.log(`added ${count} schools`);
  });

*/