const os = require('os');
const path = require('path');
const sleep = require('sleep');
const decompress = require('decompress');

const utils = require('./utils');
const loader = require('./loader');

/** parse stops.txt and return a record */
function stopsTxtFileToRecord(stopsPath, agencyId) {
    utils.logger.info("stops:{0}, agency:{1}".format(stopsPath, agencyId));
}

/** load a stops.txt file and return it as a record */
function loadGtfsStops(filePath, agencyId) {
    if(filePath.endsWith(".zip")) {
        const tmp = os.tmpdir();
        decompress(filePath, tmp, {filter: file => file.path == 'stops.txt'}).then(files => {
            var stopsPath = path.join(tmp, 'stops.txt');
            stopsTxtFileToRecord(stopsPath, agencyId);
        });
    } else {
        stopsTxtFileToRecord(filePath, agencyId);
    }
}

module.exports = {
    loadGtfsStops : loadGtfsStops
};