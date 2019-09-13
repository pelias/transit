const utils = require('./lib/utils');
const loader = require('./lib/loader');

// step 1: get transit configuration from pelias.json ... note potential early process exit
const transitConfig = utils.getTransitConfig();

// step 2: we've got a good transit config, so let's start loading Pelias...
loader.loadTransitFeeds(transitConfig);
