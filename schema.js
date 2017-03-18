'use strict';

const Joi = require('joi');

const arrayObj = Joi.object().keys({
    filename: Joi.string().required(),
    type: Joi.string().required(),
    agency_id: Joi.string().required(),
}).requiredKeys('filename', 'agency_id', 'type');

// Schema Configuration
// datapath: string (required)
// files: array of strings
// deduplicate: boolean
// adminLookup: boolean
module.exports = Joi.object().keys({
    datapath: Joi.string(),
    adminLookup: Joi.boolean(),
    import: Joi.array().min(1).items(arrayObj),
}).requiredKeys('datapath', 'adminLookup', 'import').unknown(true);

