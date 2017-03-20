# pelias.loader
Load transit landmarks into the Pelias geocoder


### Setup with just ES:
```javascript
cd eleasticsearch
bin/eleasticsearch
curl -XDELETE 'localhost:9200/pelias?pretty'
```

### OR - setup with Pelias install
```javascript
cd /srv/pelias_loader/projects/schema
nohup node scripts/drop_index.js -f
nohup node scripts/create_index.js
cd -
```


### To run:
```javascript
npm install
npm start
http://localhost:9200/_cat/indices?v
curl -XGET http://localhost:9200/pelias/_search?pretty=true&q=*:*
curl -XGET http://localhost:3100/v1/search?text=2
```


