

const LAYER_ID = 'fare';


/** generic fare outlet loader ... calls into agency_specifid sub-modules
 *  TODO: could we make this more generic ... remove the whole dependency stuff (DI for Node?)
 *  @returns stream
 */
function loadFareOutlets(filePath, agencyId, agencyName, layerName) {
    var retVal = null;
    if(agencyId === 'TRIMET') {
        const tmFares = require('./agency_specific/trimet/fare');
        retVal = tmFares.loadHopOutlets(filePath, agencyId, agencyName, LAYER_ID, layerName);
    }
    return retVal;
}


module.exports = {
    loadFareOutlets : loadFareOutlets
};
