'use strict';

const _ = require('lodash');
const Joi = require('joi');

const schema = require('./schema');
const utils = require('./lib/utils');
const loader = require('./lib/loader');


// step 1: make sure we have valid transit configuration
var peliasConfig = require('pelias-config').generate(true);
var transitConfig = _.get(peliasConfig, 'imports.transit');
const {error, value} = Joi.validate(transitConfig, schema);
if(error || transitConfig == undefined) {
    utils.logger("transit config error: " + error);
    process.exit(0);
}

// step 2: we've got a good transit config, so let's start loading Pelias...
utils.startTiming();

// step 3: load each of the configured transit feeds
loader.setTransitConfig(transitConfig);
transitConfig.files.forEach(loader.load);
