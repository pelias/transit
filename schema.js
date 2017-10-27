'use strict';
const Joi = require('joi');


const arrayObj = Joi.object().keys({
    url: Joi.string(),
    filename: Joi.string().required(),
    layerId: Joi.string().required(),
    agencyId: Joi.string(),
    agencyName: Joi.string()
}).requiredKeys('filename', 'layerId');


/** Schema Configuration

   datapath: string (required)
   feeds: array of objects ... see above (required)
   example:
    "transit": {
      "datapath": "/data/transit",
      "feeds": [
        {
          "layerId": "stops",
          "url": "http://developer.trimet.org/schedule/gtfs.zip",
          "filename": "TRIMET-stops.txt",
          "agencyId": "TRIMET",
          "agencyName": "TriMet"
        }
      ]
    },
    ...
*/
module.exports = Joi.object().keys({
    datapath: Joi.string(),
    feeds: Joi.array().min(1).items(arrayObj),
}).requiredKeys('datapath', 'feeds');
