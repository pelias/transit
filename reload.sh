HOME_DIR=/srv/pelias_loader
DATA_DIR=$HOME_DIR/data
PROJ_DIR=$HOME_DIR/projects

MAPS_SVR=http://maps7/pelias

# step 1: download transit, OSM and OR-WA data
cd $DATA_DIR
rm -rf old
mkdir old
mv oa osm transit wof ./old/

mkdir $DATA_DIR/transit
cd $DATA_DIR/transit
for i in CHERRIOTS.zip C-TRAN.zip RIDECONNECTION.zip SAM.zip SWAN.zip SMART.zip TRIMET.zip intersections.csv TRIMET-landmarks.csv
do
  wget $MAPS_SVR/transit/$i .
done

mkdir $DATA_DIR/osm
cd $DATA_DIR/osm
wget $MAPS_SVR/osm/or-wa.pbf

cd $DATA_DIR/osm
$PROJ_DIR/go_polylines/bin/pbf streets or-wa.pbf > or-wa.polylines

##
## gate script -- just download updated transit (commands above) if a cmd line param included
##
if [ ${#} -eq 0 ];then

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

    else

    mv $DATA_DIR/old/oa  $DATA_DIR/
    mv $DATA_DIR/old/wof $DATA_DIR/

fi

# step 1c. get pelias.transit's data ready
cd $PROJ_DIR/pelias.transit.loader/
npm install
npm run prep_data

# step 2: create new / empty index
cd $PROJ_DIR/schema
curl -XDELETE 'localhost:9200/pelias?pretty'
npm install
node scripts/create_index.js

# step 3: load the system...
loaders=(pelias.transit.loader polylines openaddresses openstreetmap)
for l in "${loaders[@]}"
do
    echo $l
    cd $PROJ_DIR/$l/
    npm install
    npm start
done

# step 4: create street.db and address.db for interpolation (*again, gate script)
if [ ${#} -eq 0 ];then
    mkdir $DATA_DIR/tiger
    mkdir $DATA_DIR/interpolation

    # 4a: grab tiger data (will take a few minutes, even if no data downloaded ... so run it in the background)
    TIGER_LOG=$DATA_DIR/tiger/download.log
    flock -n $TIGER_LOG -c './script/update_tiger.sh > $TIGER_LOG 2>&1' &

    # 4b: POLYLINE into street.db
    cd $PROJ_DIR/interpolation
    node cmd/polyline street.db < /data/osm/or-wa.polylines

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
    pbf2json -tags="addr:housenumber+addr:street" $DATA_DIR/osm/or-wa.pbf > osm_data.json
    node cmd/oa


    # 4e: OSM into STREET_DB & ADDRESS_DB
    flock -w 21112.111 tiger_download.log -c ''

    # 4z: move DBs to
    ## TODO maybe check size of these .db files ... backup the old ones, etc....
    mv street.db $DATA_DIR/interpolation/
    mv address.db $DATA_DIR/interpolation/

fi
