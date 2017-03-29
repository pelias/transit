const _ = require('lodash');
const Joi = require('joi');
const schema = require('../schema');

const model = require('pelias-model');


/** wrap logger here for consistent labelling */
const logger = require( 'pelias-logger' ).get('transit');

/** return an id that should be unique across transit datasets */
function makeTransitId(transitId, agencyId, layerId) {
    return `${transitId}::${agencyId}_${layerId}`;
}

/** make an record that will go into ES, which accords to the Pelias model schema */
function makePeliasRecord(layer, id, name, lat, lon, number, street, zip) {
    const doc = new model.Document('transit', layer, id);
    doc.setName('default', name);
    doc.setCentroid({lat:parseFloat(lat), lon:parseFloat(lon)});
    if(number) doc.setAddress('number', number);
    if(street) doc.setAddress('street', street);
    if(zip) doc.setAddress('zip', zip);
    return doc;
}

/** Pretty-print the total time the import took. */
function startTiming() {
  var startTime = new Date().getTime();
  process.on( 'exit', function (){
    var totalTimeTaken = (new Date().getTime() - startTime).toString();
    var seconds = totalTimeTaken.slice(0, totalTimeTaken.length - 3);
    var milliseconds = totalTimeTaken.slice(totalTimeTaken.length - 3);
    logger.info( 'Total time taken: %s.%ss', seconds, milliseconds );
  });
}

/** get the transit config from pelias.json
 *  @note: failure to find a transit config will result in an early exit from the process
 */
function getTransitConfig() {
    // step 1: make sure we have valid transit configuration
    const peliasConfig = require('pelias-config').generate(true);
    const transitConfig = _.get(peliasConfig, 'imports.transit');
    const validate = Joi.validate(transitConfig, schema);

    // step 2: config error checking ... note potential early exit
    if(validate.error) {
        logger.error(`transit config error: ${validate.error}`);
        process.exit(0);
    }
    if(transitConfig == undefined) {
        logger.error(`your 'pelias.json' config lacks a transit object entry ... @see schema.js`);
        process.exit(0);
    }

    return transitConfig;
}


module.exports = {
    startTiming : startTiming,
    makePeliasRecord : makePeliasRecord,
    makeTransitId : makeTransitId,
    getTransitConfig : getTransitConfig,
    logger : logger
};

