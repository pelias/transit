const logger = require( 'pelias-logger' ).get('transit');
const model = require('pelias-model');


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

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

module.exports = {
    startTiming : startTiming,
    makePeliasRecord : makePeliasRecord,
    logger : logger
};

