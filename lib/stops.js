const os = require('os');

const utils = require('./utils');
const parser = require('./parser');

/** parse a stops.txt file and return it as a record */
function parseGtfsStops(filePath, agencyId) {
    utils.logger.info(filePath);
    utils.logger.info(agencyId);
    //os.tmpdir();
}

module.exports = {
    parseGtfsStops : parseGtfsStops
};