# step 1: download transit, OSM and OR-WA data
cd /mnt/pelias/
mkdir ./old
mv openaddresses  openstreetmap  transit ./old/

mkdir /mnt/pelias/transit
cd /mnt/pelias/transit
scp otp@maps7:~/loader/ott/loader/gtfs/cache/*.zip .
scp otp@maps7:~/loader/ott/loader/geocoder/db_export/cache/*csv .

mkdir /mnt/pelias/openstreetmap
cd /mnt/pelias/openstreetmap
scp otp@maps7:~/loader/ott/loader/osm/cache/or-wa.pbf .

mkdir /mnt/pelias/openaddresses
cd /mnt/pelias/openaddresses
mv openaddr-collected-us_west.zip openaddr-collected-us_west.zip-OLD
wget https://s3.amazonaws.com/data.openaddresses.io/openaddr-collected-us_west.zip .
# FOR TESTING THIS SCRIPT >> cp ~/openaddr-collected-us_west.zip .
unzip openaddr-collected-us_west.zip


# step 2: clone the pelias.transit.loader and set up the config from that project as out pelias.json
cd ~/
mkdir ./old
mv pelias.json old/
rm pelias.json

cd ~/projects/
rm -rf pelias.transit.loader
git clone https://github.com/OpenTransitTools/pelias.transit.loader.git
ln -s ~/projects/pelias.transit.loader/pelias.json ~/pelias.json
cd ~/projects/pelias.transit.loader/
npm install
npm run prep_data

# step 3: create new / empty index
cd ~/projects/schema
curl -XDELETE 'localhost:9200/pelias?pretty'
node scripts/create_index.js

# step 4: load the system...
#loaders=(pelias.transit.loader openaddresses openstreetmap polylines geonames whosonfirst)
loaders=(pelias.transit.loader openaddresses openstreetmap)
for l in "${loaders[@]}"
do
    echo $l
    cd ~/projects/$l/
    npm install
    npm start
done
