HOME_DIR=/srv/pelias_loader
DATA_DIR=$HOME_DIR/data
PROJ_DIR=$HOME_DIR/projects

MAPS_SVR=http://maps7/pelias

# step 1: download transit, OSM and OR-WA data
cd $DATA_DIR
mv oa osm transit wof ./old/

mkdir $DATA_DIR/transit
cd $DATA_DIR/transit
foreach i ( CHERRIOTS.zip C-TRAN.zip RIDECONNECTION.zip SAM.zip SWAN.zip SMART.zip TRIMET.zip intersections.csv TRIMET-landmarks.csv )
  wget $MAPS_SVR/transit/$i .
done

mkdir $DATA_DIR/osm
cd $DATA_DIR/osm
wget $MAPS_SVR/osm/or-wa.pbf

## gate remaining script -- just download updated transit (commands above) if a cmd line param included
if [ $? -eq 0 ];then

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

fi