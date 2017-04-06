# pelias.transit.loader
Load transit landmarks, stops and street intersections into the Pelias geocoder.


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
