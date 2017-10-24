# pelias.transit.loader
Load transit landmarks, stops and street intersections into the Pelias geocoder.


### Note: you might need to set an env var to find pelis.json (if you keep getting 'transit' not in your schema errors, try the following):
export PELIAS_CONFIG=${PWD#/cygdrive/c}/pelias.json
$Env:PELIAS_CONFIG="$(pwd)\pelias.json"

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

### docker ... at least to download data
#####\#INITIAL CHECKOUT
1. git clone https://github.com/OpenTransitTools/pelias.transit.loader.git
1. cd pelias.transit.loader
1. git update-index --no-assume-unchanged pelias.json
1. git update-index --assume-unchanged pelias.json
#####\#DOWNLOAD DATA
1. export DATA_DIR=/data
1. rm -rf $DATA_DIR/transit
1. docker rmi -f pelias_transit
1. mkdir $DATA_DIR
1. docker build --tag pelias_transit .
1. docker images
1. docker run -i -v $DATA_DIR:/data -t pelias_transit npm run download
1. ls /data/transit
