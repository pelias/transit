'use strict';

const _ = require('lodash');
const Joi = require('joi');

const schema = require('./schema');
const utils = require('./lib/utils');
const loader = require('./lib/loader');


// step 1: make sure we have valid transit configuration
const peliasConfig = require('pelias-config').generate(true);
const transitConfig = _.get(peliasConfig, 'imports.transit');
const valid = Joi.validate(transitConfig, schema);
const error = valid[0];

// step 2: config error checking ... note potential early exit
if(error) {
    utils.logger.error(`transit config error: ${error}`);
    process.exit(0);
}
if(transitConfig == undefined || transitConfig.feeds == undefined) {
    utils.logger.error(`your pelias.json config lacks a transit.feeds array`);
    process.exit(0);
}

// step 3: we've got a good transit config, so let's start loading Pelias...
utils.startTiming();

// step 4: load each of the configured transit datasets
loader.loadTransitFeeds(transitConfig);
