# pelias.loader
Load transit landmarks into the Pelias geocoder

This package is an example app for importing 3rd party data into a Pelias Elasticsearch instance.
It uses the [Who's on First bundles](https://whosonfirst.mapzen.com/bundles/) for admin lookup (filling in city/county/state/etc for addresses).


To run:

```javascript
npm i
npm start
```

When done, 218 schools should have been added to the Elasticsearch index.
Execute `GET /pelias/venue/_search?pretty=true&q=*:*` in sense to confirm.

