>This repository is part of the [Pelias](https://github.com/pelias/pelias)
>project. Pelias is an open-source, open-data geocoder originally sponsored by
>[Mapzen](https://www.mapzen.com/). Our official user documentation is
>[here](https://github.com/pelias/documentation).

**Note**: this repository is currently in the process of being migrated from the OpenTransitTools organization in to the Pelias org  During this time some of the documentation and workflows may be changed in order to bring it more in common with other repositories under the pelias org.

# pelias.transit.loader
Load transit landmarks, stops and street intersections into the Pelias geocoder.

#### Setup empty ES index via MapZen's pelias/schema project
```javascript
cd /srv/pelias_loader/projects/schema
curl -XDELETE 'localhost:9200/pelias?pretty'
node scripts/create_index.js
cd -
```

### to run:
```javascript
npm install
npm start
http://localhost:9200/_cat/indices?v
curl -XGET http://localhost:9200/pelias/_search?pretty=true&q=*:*
curl -XGET http://localhost:3100/v1/search?text=2
curl -XGET http://localhost:9200/pelias/_search?pretty=true&q=name.default:*SMART%20Stop*
```

##### note: you might need to set an env var to find pelis.json (if you keep getting 'transit' not in your schema errors, try the following):
export PELIAS_CONFIG=${PWD#/cygdrive/c}/pelias.json

 -or-

$Env:PELIAS_CONFIG="$(pwd)\pelias.json"


### to delete transit data from the index:
1. TBD ... each version of Elastic Search has a different way to bulk delete
1. TBD ... so waiting on Pelias to officially use ElasticSearch v5.x  
1. curl -XGET 'http://localhost:9200/pelias/_search?q=source:transit&pretty'
1. might need delete api plugin: https://github.com/pelias/dockerfiles/blob/master/elasticsearch/2.4/Dockerfile


### Docker instructions

######INITIAL CHECKOUT

1. git clone https://github.com/OpenTransitTools/pelias.transit.loader.git
1. cd pelias.transit.loader
1. git update-index --no-assume-unchanged pelias.json
1. git update-index --assume-unchanged pelias.json

######DOWNLOAD DATA

1. export DATA_DIR=/data
1. rm -rf $DATA_DIR/transit/*
1. docker rmi -f pelias_transit
1. mkdir -p $DATA_DIR/transit
1. docker build --tag pelias_transit .
1. docker images
1. docker run -i -v $DATA_DIR:/data -t pelias_transit npm run download
1. ls /data/transit
1. note ... more Pelias / Transit Docker fun available from [OTT Pelias Dockerfiles](https://github.com/OpenTransitTools/pelias.dockerfiles)
