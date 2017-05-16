HOME_DIR=/srv/pelias_loader
DATA_DIR=$HOME_DIR/data
PROJ_DIR=$HOME_DIR/projects

DATA_SVR=http://maps7/pelias


# step 1: download transit, OSM and OR-WA data
cd $DATA_DIR
mv oa osm transit wof ./old/

mkdir $DATA_DIR/transit
cd $DATA_DIR/transit
wget $DATA_SVR/transit/* .

mkdir $DATA_DIR/osm
cd $DATA_DIR/osm
wget $DATA_SVR/osm/* .

mkdir $DATA_DIR/oa
cd $DATA_DIR/oa
mv openaddr-collected-us_west.zip openaddr-collected-us_west.zip-OLD
wget https://s3.amazonaws.com/data.openaddresses.io/openaddr-collected-us_west.zip .
# FOR TESTING THIS SCRIPT >> cp ~/openaddr-collected-us_west.zip .
unzip openaddr-collected-us_west.zip

# step 1b: download wof admin data
cd $PROJ_DIR/whosonfirst
npm install
npm run download -- --admin-only

# step 1c. get pelias.transit's data ready
cd $PROJ_DIR/pelias.transit.loader/
npm install
npm run prep_data

# step 2: create new / empty index
cd ~/projects/schema
curl -XDELETE 'localhost:9200/pelias?pretty'
node scripts/create_index.js

# step 3: load the system...
loaders=(pelias.transit.loader openaddresses openstreetmap)
for l in "${loaders[@]}"
do
    echo $l
    cd $PROJ_DIR/$l/
    npm install
    npm start
done

# step 4: create interpolation databases
GO