import untappd
import json
import os
import psycopg2
from datetime import datetime
import time
import argparse


parser = argparse.ArgumentParser()
parser.add_argument("--feed", default="nyc_feed")
opt = parser.parse_args()


conn = psycopg2.connect("postgres:///beer_feed")

creds = json.load(open('.credentials.json'))


with conn.cursor() as cur:
    cur.execute("SELECT token FROM tokens ORDER BY last_used LIMIT 1")
    token, = cur.fetchone()


client = untappd.Untappd(
    client_id=creds["client_id"],
    client_secret=creds["client_secret"],
    redirect_url='localhost:8083',
    user_agent='letmein'
)


client.set_access_token(token)



with conn.cursor() as cur:
    cur.execute("SELECT lat, lon FROM feeds WHERE feed=%s", (opt.feed,))
    coords = cur.fetchone()
    if coords is None:
        raise ValueError(f"{opt.feed} does not exist!")


def insert(tablename, data):
    keys = list(data.keys())
    values = ",".join([f"%({k})s" for k in keys])
    with conn.cursor() as cur:
        columns = ",".join(keys)
        cur.execute(f"""
        INSERT INTO {tablename} ({columns}) VALUES ({values})
        ON CONFLICT DO NOTHING
        """, data)
    conn.commit()




def process_checkin(checkin):
    insert("venues", {
        "venue_id": checkin["venue"]["venue_id"],
        "venue_name": checkin["venue"]["venue_name"],
        "venue_slug": checkin["venue"]["venue_slug"],
        "lat": checkin["venue"]["location"]["lat"],
        "lng": checkin["venue"]["location"]["lng"],
    })

    insert("breweries", {
        "brewery_id": checkin["brewery"]["brewery_id"],
        "brewery_name": checkin["brewery"]["brewery_name"],
        "brewery_page_url": checkin["brewery"]["brewery_page_url"],
        "brewery_slug": checkin["brewery"]["brewery_slug"],
        "brewery_type": checkin["brewery"]["brewery_type"],    
    })

    with conn.cursor() as cur:
        cur.execute("SELECT rating_count, beer_id, pic FROM beers WHERE beer_id=%s", (checkin["beer"]["bid"],))
        res = cur.fetchall()

        update = False
        if len(res) == 1:
            rating_count, beer_id, pic = res[0]
            if rating_count < 500:
                update = True
            if pic is None:
                update = True



        if len(res) == 0 or update:
            time.sleep(2)
            beer = client.beer.info(checkin["beer"]["bid"])

            if update:
                if pic is None:
                    print("Updating beer because it doesn't have a picture")
                else:
                    print(f"Updating beer, because it only has {rating_count} ratings, now has {beer['response']['beer']['rating_count']}")
                with conn.cursor() as cur:
                    cur.execute("""
                        UPDATE beers SET last_updated=now(), rating_score=%(score)s, rating_count=%(count)s
                        WHERE beer_id=%(beer_id)s
                    """, {
                        "score": beer["response"]["beer"]["rating_score"],
                        "count": beer["response"]["beer"]["rating_count"],
                        "beer_id": beer["response"]["beer"]["bid"],
                    })
                conn.commit()
            else:
                print("Adding new beer to database")
                insert("beers", {
                    "beer_id": beer["response"]["beer"]["bid"],
                    "auth_rating": beer["response"]["beer"]["auth_rating"],
                    "beer_abv": beer["response"]["beer"]["beer_abv"],
                    "beer_name": beer["response"]["beer"]["beer_name"],
                    "beer_style": beer["response"]["beer"]["beer_style"],
                    "rating_count": beer["response"]["beer"]["rating_count"],
                    "rating_score": beer["response"]["beer"]["rating_score"],
                    "last_updated": datetime.now(),
                    "pic": beer["response"]["beer"]["beer_label"],
                    "slug": beer["response"]["beer"]["beer_slug"]
                })
        else:
            print("Beer cache hit!")


    insert("checkins", {
        "beer_id": checkin["beer"]["bid"],
        "brewery_id": checkin["brewery"]["brewery_id"],
        "checkin_comment": checkin["checkin_comment"],
        "checkin_id": checkin["checkin_id"],
        "rating": checkin["rating_score"],
        "created_at": checkin["created_at"],
        "venue_id": checkin["venue"]["venue_id"],
        "user_id": checkin["user"]["uid"],
        "feed": opt.feed,
    })


with conn.cursor() as cur:
    cur.execute("SELECT MAX(checkin_id) FROM checkins WHERE feed=%s", (opt.feed,))
    max_id, = cur.fetchone()

try:
    checkins = client.thepub.local(lat=coords[0], lng=coords[1], radius=12, dist_pref="km", min_id=max_id)
    print(f'Fetched {len(checkins["response"]["checkins"]["items"])} new checkins!')

    # iterate in reverse order to process the oldest first.  That way if we crash, we won't create gaps in the feed
    for checkin in checkins["response"]["checkins"]["items"][::-1]:
        print(f"Processing {checkin['checkin_id']}")
        process_checkin(checkin)


except Exception as e:
    print(e)
    print("Rotating token")
    with conn.cursor() as cur:
        cur.execute("UPDATE tokens SET last_used=now() WHERE token=%s", (token,))
    conn.commit()