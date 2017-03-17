'use strict';

var peliasConfig = require( 'pelias-config' ).generate(require('./schema'));
var parameters = require( './lib/parameters' );

const csvParse = require( 'csv-parse' );
const through2 = require('through2');
const request = require('request');

const adminLookupStream = require('pelias-wof-admin-lookup');
const model = require( 'pelias-model' );
const dbclient = require( 'pelias-dbclient' );

// extracts 12.121212,-21.212121 from "some text (12.121212, -21.212121)"
const latLonRegex = /.*\((-?\d+\.\d+), (-?\d+\.\d+)\)$/;

// can parse number and street from the following address formats:
// - 123 Main Street
// - 123A Main Street
// - 123-A Main Street
const addressRegex = /^(\d+(?:-?[A-Z])?) (.*)$/i;

// matches short- and long-form postal codes
const zipRegex = /^(\d{5})-?(\d{4})?$/;

// we're only interested in current (2016) schools
function is2016(record, _, callback) {
  if (record.SchoolYear === '2016') {
    this.push(record);
  }
  callback();
}

// extracts the lat/lon from the geocoded location
// if there is no lat/lon, nothing is passed down the stream
function extractLatLon(record, _, callback) {
  const latLonMatcher = record['Geocoded Location'].match(latLonRegex);

  if (latLonMatcher) {
    record.centroid = {
      lat: parseFloat(latLonMatcher[1]),
      lon: parseFloat(latLonMatcher[2])
    };
    this.push(record);
  }

  callback();
}

// extracts the number and street from the single line address
// if address is unparseable, nothing is passed down the stream
function parseAddress(record, _, callback) {
  const addressMatcher = record.Street1.match(addressRegex);

  if (addressMatcher) {
    record.parsedAddress = {
      number: addressMatcher[1],
      street: addressMatcher[2]
    }
    this.push(record);
  }

  callback();
}

function createDocument(record, _, callback) {
  const id = `${record.DistrictCode}-${record.SchoolCode}`;

  // formats '12345' as '12345' and '123456789' as '12345-6789'
  const formattedZip = record.Zip.match(zipRegex).slice(1).filter((e) => {return e;}).join('-');

  const doc = new model.Document( 'delaware_schools', 'venue', id );
  doc.setName( 'default', record.SchoolName );
  doc.setCentroid(record.centroid);
  doc.setAddress('number', record.parsedAddress.number);
  doc.setAddress('street', record.parsedAddress.street);
  doc.setAddress('zip', formattedZip);

  count++;

  console.log(doc);
  callback(null, doc);
}


var args = parameters.interpretUserArgs(process.argv.slice( 2 ));
var files = parameters.getFileList(peliasConfig, args);
console.log(files);

/*
let count = 0;

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