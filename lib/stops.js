const os = require('os');
const path = require('path');
const decompress = require('decompress');

const utils = require('./utils');
const parser = require('./parser');


/** parse a stops.txt file and return it as a record */
function parseGtfsStops(filePath, agencyId) {
    var stopsPath = filePath;
    if(filePath.endsWith(".zip"))
    {
        decompress(filePath, os.tmpdir());
    }
    utils.logger.info("stops:{0}, agency:{1}".format(stopsPath, agencyId));
}

module.exports = {
    parseGtfsStops : parseGtfsStops
};