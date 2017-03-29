'use strict';

const _ = require('lodash');
const Joi = require('joi');

const schema = require('./schema');
const utils = require('./lib/utils');
const loader = require('./lib/loader');


// step 1: make sure we have valid transit configuration
const peliasConfig = require('pelias-config').generate(true);
const transitConfig = _.get(peliasConfig, 'imports.transit');
const validate = Joi.validate(transitConfig, schema);

// step 2: config error checking ... note potential early exit
if(validate.error) {
    utils.logger.error(`transit config error: ${validate.error}`);
    process.exit(0);
}
if(transitConfig == undefined) {
    utils.logger.error(`your 'pelias.json' config lacks a transit object entry ... @see schema.js`);
    process.exit(0);
}

// step 3: we've got a good transit config, so let's start loading Pelias...
loader.loadTransitFeeds(transitConfig);
