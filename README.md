# pelias.transit.loader
Load transit landmarks, stops and street intersections into the Pelias geocoder.


### Note: you might need to set an env var to find pelis.json (if you keep getting 'transit' not in your schema errors, try the following):
export PELIAS_CONFIG=${PWD#/cygdrive/c}/pelias.json

### Setup empty ES index with Pelias schema
```javascript
cd /srv/pelias_loader/projects/schema
curl -XDELETE 'localhost:9200/pelias?pretty'
node scripts/create_index.js
cd -
```

### OR setup with just ES:
```javascript
cd eleasticsearch
bin/eleasticsearch
curl -XDELETE 'localhost:9200/pelias?pretty'
```

### To run:
```javascript
npm install
npm start
http://localhost:9200/_cat/indices?v
curl -XGET http://localhost:9200/pelias/_search?pretty=true&q=*:*
curl -XGET http://localhost:3100/v1/search?text=2
```


        {
          "layerId" : "stops",
          "url" : "http://developer.trimet.org/schedule/gtfs.zip",
          "filename" : "TRIMET-stops.txt",
          "agencyId"   : "TRIMET",
          "agencyName" : "TriMet"
        },
        {
          "layerId" : "stops",
          "url" : "http://oregon-gtfs.com/gtfs_data/rideconnection-or-us/rideconnection-or-us.zip",
          "filename" : "RIDECONNECTION-stops.txt",
          "agencyId"   : "RIDECONNECTION",
          "agencyName" : "Ride Connection"
        },
        {
          "layerId" : "stops",
          "url" : "http://cherriots.org/developer/gtfs.zip",
          "filename" : "CHERRIOTS-stops.txt",
          "agencyId"   : "CHERRIOTS",
          "agencyName" : "Cherriots / Salem-Keizer Transit"
        },
        {
          "layerId" : "stops",
          "url" : "http://oregon-gtfs.com/gtfs_data/sandy-or-us/sandy-or-us.zip",
          "filename" : "SAM-stops.txt",
          "agencyId"   : "SAM",
          "agencyName" : "Sandy Area Metro"
        },
        {
          "layerId" : "stops",
          "url" : "http://data.trilliumtransit.com/gtfs/wilsonville-or-us/wilsonville-or-us.zip",
          "filename" : "SMART-stops.txt",
          "agencyId"   : "SMART",
          "agencyName" : "SMART"
        },