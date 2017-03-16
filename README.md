# pelias.loader
Load transit landmarks into the Pelias geocoder

This package is an example app for importing 3rd party data into a Pelias Elasticsearch instance.
It uses the [Who's on First bundles](https://whosonfirst.mapzen.com/bundles/) for admin lookup (filling in city/county/state/etc for addresses).


Setup with just ES:
```javascript
cd eleasticsearch
bin/eleasticsearch
curl -XDELETE 'localhost:9200/pelias?pretty'
'


To run:
```javascript
npm install
npm start
http://localhost:9200/_cat/indices?v
curl -XGET http://localhost:9200/pelias/_search?pretty=true&q=*:*
```


