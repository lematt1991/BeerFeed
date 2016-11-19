var request = require('request-promise');
var pg = require('pg');
var util = require('util');
var fs = require('fs');

function startProc(args){
    var username = args.username;
    var access_token = args.access_token;
    var setTimeoutObj = args.setTimeoutObj
    var lastID = args.lastID;
    var waitTime = 16000 //miliseconds
  
    var tokens = [access_token];

    var db = new pg.Client(process.env.OPENSHIFT_POSTGRESQL_DB_URL);
    db.connect();
  
    function getFeed(args){
        var base = 'https://api.untappd.com/v4/thepub/local'
        var url = `${base}?access_token=${tokens[0]}&lat=${args.lat}&lng=${args.lng}&min_id=${args.min_id}&radius=25`
        console.log(url)
        return request(url);
    }

    function getBeer(bid){
        var url = `https://api.untappd.com/v4/beer/info/${bid}?access_token=${tokens[0]}`;
        return request(url);
    }

    function processCheckin(checkin){
        if(checkin.venue.contact.venue_url === ""){//probably a private residence
            console.log('Skipping due to no url')
            return;
        }
        getBeer(checkin.beer.bid).then(beer_data => {
            var beer = undefined;
            try{
                beer = JSON.parse(beer_data).response.beer;
            }catch(e){
                console.log('JSON.parse error! ' + beer_data)
                return;
            }
            var date = new Date(checkin.created_at);
            var formattedDate = util.format('%d-%d-%d %d:%d:%d', date.getFullYear(), 
                date.getMonth()+1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            if(beer.rating_score >= 4.0){
                console.log('Inserting beer %s: %s', checkin.brewery.brewery_name, checkin.beer.beer_name)

                var q = util.format('INSERT INTO beers (checkin_id, name, brewery, venue, created, rating, lat, lon, username, pic, bid, beer_slug, brewery_id, brewery_slug, venue_id, venue_slug, geom)' + 
                                    ' SELECT %d, $$%s$$, $$%s$$, $$%s$$, $$%s$$, %d, %d, %d, $$%s$$, $$%s$$, %d, $$%s$$, %d, $$%s$$, %d, $$%s$$, %s WHERE NOT ' + 
                                    'EXISTS(SELECT 1 FROM beers WHERE checkin_id = %d)',
                                    checkin.checkin_id, checkin.beer.beer_name, checkin.brewery.brewery_name,
                                    checkin.venue.venue_name, formattedDate, beer.rating_score, 
                                    checkin.venue.location.lat, checkin.venue.location.lng, username, 
                                    checkin.beer.beer_label, checkin.beer.bid, checkin.beer.beer_slug,
                                    checkin.brewery.brewery_id, checkin.brewery.brewery_slug, 
                                    checkin.venue.venue_id, checkin.venue.venue_slug, 
                                    `ST_GeomFromText('POINT(${checkin.venue.location.lng} ${checkin.venue.location.lat})', 4326)`,
                                    checkin.checkin_id);
                console.log(q)
                db.query(q).then(function(){}).catch(function(err){
                    console.log(err)
                }); 
            }else{
                console.log('Skipping %s, rating = %d', checkin.beer.beer_name, beer.rating_score);
            }
        }).catch(err => {
            console.log(err);
        })
    }

    function iter(){
        //Query the users table each iteration in case location changes
        var query = 'SELECT * FROM users WHERE id=\'' + username + '\';';
        try{
            db.query(query).then(result => {
                var row = result.rows[0];
                getFeed({'lat' : row.lat, 'lng' : row.lon, 'min_id' : lastID}).then(feedData => {
                    var data = undefined; 
                    try{       
                        data = JSON.parse(feedData);
                    }catch(e){
                        console.log(data)
                        console.log('Error parsing JSON (iter)! ' + data)
                        setTimeoutObj(setTimeout(iter, waitTime));//try again
                    }
                    var checkins = data.response.checkins.items;
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
                }).catch(err => {
                    console.log(err)
                    console.log('Access %s token exhausted, recycling...', tokens[0])
                    tokens.push(tokens.shift());
                    setTimeoutObj(setTimeout(iter, waitTime))//try again
                });
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
