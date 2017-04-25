require('dotenv').config({silent : true})
var pg = require('pg');
var fs = require('fs');
var UntappdClient = require('node-untappd');

function startProc(args){
    var username = args.username;
    var access_token = args.access_token;
    var setTimeoutObj = args.setTimeoutObj
    var lastID = args.lastID;
    var waitTime = 16000 //milliseconds

    var untappd = new UntappdClient();

    untappd.setAccessToken(access_token);

    var tokens = [];

    var db = new pg.Client(process.env.NODE_ENV==='debug' ? {database : 'beerfeed'} : process.env.OPENSHIFT_POSTGRESQL_DB_URL);
    db.connect();

    /**
     * Insert a row into a table int he database.  If the primary key
     * already exists, then do nothing.
     * @param {string} table - The table to insert into
     * @param {string} primary_key - Primary key of the table
     * @param {array} values - Array of the values to be inserted into 
     *      the table.  Strings get wrapped in `$` to escape quotes.  
     */
    function dbInsert(table, primary_key, values){
        values = values.map(v => {
            if(v == null){
                return 'NULL'
            }
            if(typeof(v) === 'string'){
                return `$$${v}$$`
            }else if(typeof(v) === 'object'){
                return v.val;
            }
            return v
        })

        var q = `
            INSERT INTO ${table} SELECT ${values.join(',')} WHERE
                NOT EXISTS (
                    SELECT 1 FROM ${table} 
                        WHERE ${primary_key.name}=${primary_key.value}
                );
        `

        console.log(q)
        return db.query(q, (err, result) => {
            if(err){
                console.log(err)
            }
        })
    }

    /**
     * Retrieve beer information from beer/info endpoint
     * @param {object} checkin - the checkin object returned from local pub endpoint
     * @param {boolean} found - if the beer was found in the database.  If it was, then
     *                          then it means that we need to update the timestamp
     */
    function getBeer(checkin, found){
        untappd.beerInfo((error, beer_data) => {
            if(error){
                console.log(error);
                return;
            }
            beer = beer_data.response.beer;
            var formattedDate = new Date(checkin.created_at).toISOString();
            if(beer == null){
                console.log(beer_data)
                return
            }

            if(found){
                var datestr = new Date().toISOString()
                var q = `
                    UPDATE beers SET rating=${beer.rating_score}, last_updated='${datestr}'
                        WHERE bid=${checkin.beer.bid};
                `
                console.log(q)
                db.query(q, (err, result) => {
                    if(err){
                        console.log(err)
                    }
                })
            }else{ 
                // Insert checkin
                dbInsert('checkins', {name : 'checkin_id', value : checkin.checkin_id}, [
                    checkin.checkin_id, 
                    checkin.beer.bid, 
                    checkin.venue.venue_id,
                    checkin.brewery.brewery_id,
                    formattedDate,
                    username
                ])
                
                // Insert brewery
                dbInsert('breweries', {name : 'brewery_id', value : checkin.brewery.brewery_id}, [
                    checkin.brewery.brewery_id,
                    checkin.brewery.brewery_name,
                    checkin.brewery.brewery_slug,
                    checkin.brewery.contact.twitter,
                    checkin.brewery.contact.facebook,
                    checkin.brewery.contact.url
                ])
                // Insert beer
                dbInsert('beers', {name : 'bid', value : checkin.beer.bid}, [
                    checkin.beer.bid,
                    checkin.beer.beer_name,
                    beer.rating_score,
                    checkin.brewery.brewery_id,
                    checkin.beer.beer_slug,
                    checkin.beer.beer_style,
                    checkin.beer.beer_abv,
                    checkin.beer.beer_ibu,
                    checkin.beer.beer_label,
                    new Date().toISOString()
                ])

                dbInsert('venues', {name : 'venue_id', value : checkin.venue.venue_id}, [
                    checkin.venue.venue_id,
                    checkin.venue.venue_name,
                    checkin.venue.venue_slug,
                    checkin.venue.contact.twitter,
                    checkin.venue.contact.venue_url,
                    checkin.venue.primary_category,
                    checkin.venue.is_verified,
                    {
                        val : `ST_GeomFromText('POINT(${checkin.venue.location.lng} ${checkin.venue.location.lat})', 4326)`
                    }
                ])
            }
        }, {BID : checkin.beer.bid})
    }

    /**
     * Process a single checkin.  We first lookup the beer in our beers 
     * table.  If it exists, then we look at when it was last updated.
     * If it has been updated in the last week, we simply insert the 
     * checkin into the checkins table.  If it is stale, then we make a 
     * call to the beer/info endpoint and update the rating and last updated
     * fields of the existing row.  If it wasn't found at all, then we also
     * insert rows into the breweries and venues tables.
     * @param {object} checkin - One element from the returned array of checkins
     *      from the local/pub endpoint
     */
    function processCheckin(checkin){
        if(checkin == null || checkin.venue == null || 
           checkin.venue.contact == null || checkin.venue.contact.venue_url == null ||
           checkin.venue.contact.venue_url === ""){//probably a private residence
            console.log('Skipping due to no url')
            return;
        }

        db.query(`SELECT * FROM beers WHERE bid=${checkin.beer.bid}`, (err, result) => {
            if(err){
                console.log(err)
            }else{
                if(result.rows.length > 0){
                    var datestr = result.rows[0].last_updated;
                    sevenDaysAgo = new Date().getTime() - (7 * 24 * 60 * 60 * 1000)
                    if(datestr == null || new Date(datestr).getTime() < sevenDaysAgo){
                        console.log(`Updating beer rating, last_updated = ${datestr}`)
                        try{
                            getBeer(checkin, true)
                        }catch(e){
                            console.log(e);
                        }
                    }else{
                        console.log(`Found cached beer in database.  Last updated on ${datestr}`)
                        // Insert checkin
                        dbInsert('checkins', {name : 'checkin_id', value : checkin.checkin_id}, [
                            checkin.checkin_id, 
                            checkin.beer.bid, 
                            checkin.venue.venue_id,
                            checkin.brewery.brewery_id,
                            new Date(checkin.created_at).toISOString(),
                            username
                        ])
                        //Insert venue
                        dbInsert('venues', {name : 'venue_id', value : checkin.venue.venue_id}, [
                            checkin.venue.venue_id,
                            checkin.venue.venue_name,
                            checkin.venue.venue_slug,
                            checkin.venue.contact.twitter,
                            checkin.venue.contact.venue_url,
                            checkin.venue.primary_category,
                            checkin.venue.is_verified,
                            {
                                val : `ST_GeomFromText('POINT(${checkin.venue.location.lng} ${checkin.venue.location.lat})', 4326)`
                            }
                        ])
                    }
                }else{
                    console.log('Beer not found in database')
                    getBeer(checkin, false)
                }
            }
        })
    }

    /**
     * Perform a single iteration of the checkin process.  This will make a 
     * call to the local/pub endpoint receiving any new checkins.  For 
     * each checkin we will call the `processCheckin` function to do the rest
     */
    function iter(){
        //Query the users table each iteration in case location changes
        var query = 'SELECT * FROM users WHERE id=\'' + username + '\';';
        try{
            db.query(query).then(result => {
                var row = result.rows[0];
                untappd.pubFeed((err, feedData) => {
                    if(err || 
                        !feedData.response ||
                        !feedData.response.checkins || 
                        feedData.meta.error_type === 'invalid_limit')
                    {
                        console.log(err)
                        console.log('Access %s token exhausted, recycling...', tokens[0])
                        tokens.push(untappd.getAccessToken())
                        untappd.setAccessToken(tokens.shift())
                        setTimeoutObj(setTimeout(iter, waitTime))//try again
                    }else{
                        var checkins = feedData.response.checkins.items;
                        console.log('\n' + checkins.length + ' checkins found')
              
                        for(var i = 0; i < checkins.length; i++){
                            processCheckin(checkins[i]);
                        }
                        console.log('len = ' + checkins.length)
                        console.log('waitTime = ' + waitTime)
                        if(checkins.length > 12 && lastID != 0){
                            waitTime = waitTime / 2;
                        }else if(checkins.length == 0 && waitTime < 1800000){// don't wait longer than 30 minutes
                            waitTime = waitTime * 2;
                        }
                        lastID = checkins.length > 0 ? checkins[0].checkin_id : lastID;
                        console.log(username + ' Going to sleep for ' + (waitTime/1000) + ' seconds')
                        setTimeoutObj(setTimeout(iter, waitTime));
                    }
                }, {
                    lat : row.lat,
                    lng : row.lon,
                    min_id : lastID,
                    radius : 25
                })
            }).catch(function(err){
                console.log(err)
            })
        }catch(e){
            console.log(e)
            setTimeoutObj(setTimeout(iter, waitTime))//try again...
        }
    }
  
    function getWorkerTokens(){
        db.query('SELECT access_token FROM users WHERE general_purpose=True;').then(result => {
            tokens = tokens.concat(result.rows.map(r => {
                return r.access_token
            }));
            iter();   
        }).catch(err => {
            console.log(err);
        })
    }

    var query = 'SELECT checkin_id FROM checkins WHERE username = \'' + username + '\' ORDER BY checkin_id DESC LIMIT 1;';
    db.query(query).then(result => {
        if(result.rows.length == 1){
            lastID = result.rows[0].checkin_id;
            getWorkerTokens();
        }else{
            getWorkerTokens();
        }
    }).catch(err => { 
        console.log(err);
    })  
}

module.exports.startProc = startProc;
