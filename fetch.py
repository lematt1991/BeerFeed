import untappd
import json
import os
import psycopg2
from datetime import datetime
import time


conn = psycopg2.connect("postgres:///beer_feed")

creds = json.load(open('.credentials.json'))

client = untappd.Untappd(
    client_id=creds["client_id"],
    client_secret=creds["client_secret"],
    redirect_url='localhost:8083',
    user_agent='letmein'
)


client.set_access_token(creds["user_token"])


coords=40.714404, -73.942352


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
        cur.execute("SELECT * FROM beers WHERE beer_id=%s", (checkin["beer"]["bid"],))
        res = cur.fetchall()

        if len(res) == 0:
            try:
                time.sleep(2)
                beer = client.beer.info(checkin["beer"]["bid"])
            except Exception as e:
                print(e)
            insert("beers", {
                "beer_id": beer["response"]["beer"]["bid"],
                "auth_rating": beer["response"]["beer"]["auth_rating"],
                "beer_abv": beer["response"]["beer"]["beer_abv"],
                "beer_name": beer["response"]["beer"]["beer_name"],
                "beer_style": beer["response"]["beer"]["beer_style"],
                "rating_count": beer["response"]["beer"]["rating_count"],
                "rating_score": beer["response"]["beer"]["rating_score"],
                "last_updated": datetime.now()
            })

    insert("checkins", {
        "beer_id": checkin["beer"]["bid"],
        "brewery_id": checkin["brewery"]["brewery_id"],
        "checkin_comment": checkin["checkin_comment"],
        "checkin_id": checkin["checkin_id"],
        "created_at": checkin["created_at"],
        "venue_id": checkin["venue"]["venue_id"],
    })


with conn.cursor() as cur:
    cur.execute("SELECT MAX(checkin_id) FROM checkins")
    max_id, = cur.fetchone()

checkins = client.thepub.local(lat=coords[0], lng=coords[1], radius=10, dist_pref="km", min_id=max_id)
print(f'Fetched {len(checkins["response"]["checkins"]["items"])} new checkins!')

# iterate in reverse order to process the oldest first.  That way if we crash, we won't create gaps in the feed
for checkin in checkins["response"]["checkins"]["items"][::-1]:
    process_checkin(checkin)

