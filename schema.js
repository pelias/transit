'use strict';

const Joi = require('joi');

const arrayObj = Joi.object().keys({
    filename: Joi.string().required(),
    type: Joi.string().required().valid('stops', 'pr', 'tc', 'tvm', 'intersection', 'carshare', 'bikeshare'),
    agencyId: Joi.string().required(),
}).requiredKeys('filename', 'agencyId', 'type');

/** Schema Configuration

   datapath: string (required)
   feeds: array of objects ... see above (required)
   example:
    "transit": {
      "datapath": "/mnt/pelias/transit",
      "feeds": [
        {
          "type" : "stops",
          "filename" : "TRIMET-stops.txt",
          "agencyId" : "TRIMET"
        }
      ]
    },
*/
module.exports = Joi.object().keys({
    datapath: Joi.string(),
    feeds: Joi.array().min(1).items(arrayObj),
}).requiredKeys('datapath', 'feeds');

