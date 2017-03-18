const utils = require('./utils');
const parser = require('./parser');


/** parse a stops.txt file and return it as a record */
function parseGtfsStops() {
    utils.logger.info("stops");
}

module.exports = {
    parseGtfsStops : parseGtfsStops
};