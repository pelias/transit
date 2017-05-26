HOME_DIR=/srv/pelias_loader
DATA_DIR=$HOME_DIR/data
PROJ_DIR=$HOME_DIR/projects
OSM_FILE=or-wa.pbf
POLYLINES_FILE=or-wa.polylines

MAPS_SVR=http://maps7/pelias

# step 1: download and prep transit, OSM, OA and WOF datasets
cd $DATA_DIR
rm -rf old
mkdir old
mv oa osm transit wof ./old/

echo "DOWNLOAD transit data from $MAPS_SVR"
mkdir $DATA_DIR/transit
cd $DATA_DIR/transit
for i in CHERRIOTS.zip C-TRAN.zip RIDECONNECTION.zip SAM.zip SWAN.zip SMART.zip TRIMET.zip intersections.csv TRIMET-landmarks.csv
do
  wget $MAPS_SVR/transit/$i .
done

echo "DOWNLOAD $OSM_FILE data from $MAPS_SVR"
mkdir $DATA_DIR/osm
cd $DATA_DIR/osm
wget $MAPS_SVR/osm/$OSM_FILE

echo "CREATE $POLYLINES_FILE data from $OSM_FILE data from $MAPS_SVR"
cd $DATA_DIR/osm
$PROJ_DIR/go_polylines/bin/pbf streets $OSM_FILE > $POLYLINES_FILE

##
## gate script -- just download updated transit (commands above) if a cmd line param included
##
if [ ${#} -eq 0 ];then
    # step 1a: grab OpenAddress data for TriMet area...
    echo "DOWNLOAD OpenAddress data"
    mkdir $DATA_DIR/oa
    cd $DATA_DIR/oa
    mv openaddr-collected-us_west.zip openaddr-collected-us_west.zip-OLD
    wget https://s3.amazonaws.com/data.openaddresses.io/openaddr-collected-us_west.zip .
    # FOR TESTING THIS SCRIPT >> cp ~/openaddr-collected-us_west.zip .
    unzip openaddr-collected-us_west.zip

    # step 1b: download wof admin data
    echo "DOWNLOAD whosonfirst data"
    cd $PROJ_DIR/whosonfirst
    npm install
    npm run download -- --admin-only
else
    # step 1ab alternate: move OLD oa and wof datasets back into position and move on
    mv $DATA_DIR/old/oa  $DATA_DIR/
    mv $DATA_DIR/old/wof $DATA_DIR/
fi

# step 1c. get pelias.transit's data ready
echo "PREP Transit Data"
cd $PROJ_DIR/pelias.transit.loader/
git pull
npm install
npm run prep_data


# step 2: create new / empty index
echo "PREP ElasticSearch SCHEMA"
cd $PROJ_DIR/schema
curl -XDELETE 'localhost:9200/pelias?pretty'
npm install
node scripts/create_index.js


# step 3: load the system...
loaders=(pelias.transit.loader polylines openaddresses openstreetmap)
echo "LOADING the ${loaders[*]} datasets into ElasticSearch"
for l in "${loaders[@]}"
do
    echo $l
    cd $PROJ_DIR/$l/
    npm install
    npm start
done


# step 4: create street.db and address.db for interpolation (*again, gate script)
# see: https://github.com/pelias/interpolation#building-the-databases
echo "BUILDING street.db and address.db for interpolation"
cd $PROJ_DIR/interpolation/
rm *.log *.db osm_data.json

# 4a: grab tiger data (will take a few minutes, even if no data downloaded ... so run it in the background)
mkdir $DATA_DIR/tiger
export TIGER_LOG=$DATA_DIR/tiger/download.log
flock -n $TIGER_LOG -c './script/update_tiger.sh > $TIGER_LOG 2>&1' &

# 4b: POLYLINE into street.db
node cmd/polyline street.db < /data/osm/$POLYLINES_FILE

# 4c: OA into STREET_DB & ADDRESS_DB
for x in clark city_of_richland
do
    OA_CSV="$DATA_DIR/oa/us/wa/$x.csv"
    echo $OA_CSV
    node cmd/oa address.db street.db < $OA_CSV > openaddess-wa.log 2>&1
done
for x in city_of_salem clackamas gresham hood_river marion_and_polk multnomah oregon_city portland washington yarnhill
do
    OA_CSV="$DATA_DIR/oa/us/or/$x.csv"
    echo $OA_CSV
    node cmd/oa address.db street.db < $OA_CSV > openaddess-or.log 2>&1
done

# 4d: OSM into STREET_DB & ADDRESS_DB
pbf2json -tags="addr:housenumber+addr:street" $DATA_DIR/osm/$OSM_FILE > osm_data.json
node cmd/osm address.db street.db < osm_data.json

# 4e: OSM into STREET_DB & ADDRESS_DB
flock -w 21112.111 tiger_download.log -c 'node cmd/tiger address.db street.db'

# 4f: interpolate step
node cmd/vertices address.db street.db

# 4z: move DBs to
## TODO maybe check size of these .db files ... backup the old ones, etc....
mkdir $DATA_DIR/interpolation
mv street.db $DATA_DIR/interpolation/
mv address.db $DATA_DIR/interpolation/
