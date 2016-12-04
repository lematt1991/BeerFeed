require('dotenv').config({silent : true})
var request = require('request-promise');
var pg = require('pg');
var util = require('util');
var fs = require('fs');
var UntappdClient = require('node-untappd');

function startProc(args){
    var username = args.username;
    var access_token = args.access_token;
    var setTimeoutObj = args.setTimeoutObj
    var lastID = args.lastID;
    var waitTime = 16000 //miliseconds

    var untappd = new UntappdClient();

    untappd.setAccessToken(access_token);

    var tokens = [];

    var db = new pg.Client(process.env.OPENSHIFT_POSTGRESQL_DB_URL);
    db.connect();

    function dbInsert(table, primary_key, values){
        values = values.map(v => {
            if(typeof(v) === 'string'){
                return `$$${v}$$`
            }else if(typeof(v) === 'object'){
                return v.val;
            }
            return v
        })

        var q = `
            INSERT INTO ${table} SELECT ${values.join(',')} WHERE
                NOT EXISTS (SELECT 1 FROM ${table} WHERE ${primary_key.name}=${primary_key.value});
        `

        console.log(q)
        return db.query(q, (err, result) => {
            if(err){
                console.log(err)
            }
        })
    }

    function processCheckin(checkin){
        if(checkin.venue.contact.venue_url === ""){//probably a private residence
            console.log('Skipping due to no url')
            return;
        }

        untappd.beerInfo((error, beer_data) => {
            if(error){
                console.log(error);
                return;
            }
            beer = beer_data.response.beer;
            var date = new Date(checkin.created_at);
            var formattedDate = util.format('%d-%d-%d %d:%d:%d', date.getFullYear(), 
                date.getMonth()+1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            if(beer.rating_score >= 4.0){
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
                dbInsert('beers_', {name : 'bid', value : checkin.beer.bid}, [
                    checkin.beer.bid,
                    checkin.beer.beer_name,
                    beer.rating_score,
                    checkin.brewery.brewery_id,
                    checkin.beer.beer_slug,
                    checkin.beer.beer_style,
                    checkin.beer.beer_abv,
                    checkin.beer.beer_ibu
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

                // TODO: remove this
                dbInsert('beers', {name : 'checkin_id', value : checkin.checkin_id}, [
                    checkin.checkin_id, 
                    checkin.beer.beer_name, 
                    checkin.brewery.brewery_name,             
                    checkin.venue.venue_name, 
                    formattedDate, 
                    beer.rating_score, 
                    checkin.venue.location.lat, 
                    checkin.venue.location.lng, 
                    username, 
                    checkin.beer.beer_label, 
                    checkin.beer.bid, 
                    checkin.beer.beer_slug,
                    checkin.brewery.brewery_id, 
                    checkin.brewery.brewery_slug, 
                    checkin.venue.venue_id, 
                    checkin.venue.venue_slug, 
                    {
                        val : `ST_GeomFromText('POINT(${checkin.venue.location.lng} ${checkin.venue.location.lat})', 4326)`
                    }                
                ])

            }
        }, {BID : checkin.beer.bid})
    }

    function iter(){
        //Query the users table each iteration in case location changes
        var query = 'SELECT * FROM users WHERE id=\'' + username + '\';';
        try{
            db.query(query).then(result => {
                var row = result.rows[0];
                untappd.pubFeed((err, feedData) => {
                    if(err || feedData.meta.error_type === 'invalid_limit'){
                        console.log(err)
                        console.log('Access %s token exhausted, recycling...', tokens[0])
                        tokens.push(untappd.getAccessToken())
                        untappd.setAccessToken(tokens.shift())
                        setTimeoutObj(setTimeout(iter, waitTime))//try again
                    }else{

                        debugger
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
                        console.log(username + 'Going to sleep for ' + (waitTime/1000) + ' seconds')
                        setTimeoutObj(setTimeout(iter, waitTime));
                    }
                }, {
                    lat : row.lat,
                    lng : row.lon,
                    min_id : lastID
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

    var query = 'SELECT checkin_id FROM beers WHERE username = \'' + username + '\' ORDER BY checkin_id DESC LIMIT 1;';
    db.query(query).then(result => {
        if(result.rows.length == 1){
            //lastID = result.rows[0].checkin_id;
            getWorkerTokens();
        }else{
            getWorkerTokens();
        }
    }).catch(err => { 
        console.log(err);
    })  
}

module.exports.startProc = startProc;
