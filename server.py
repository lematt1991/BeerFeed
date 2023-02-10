from typing import Union
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import Request
import psycopg2
import psycopg2.extras

templates = Jinja2Templates(directory="build")

app = FastAPI()


conn = psycopg2.connect("postgres:///beer_feed")

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


app.mount("/static", StaticFiles(directory="build/static"), name="static")
app.mount("/js", StaticFiles(directory="build/static/js"), name="js")


@app.get("/Feed/{location}/{id}",)
def feed_limit(location: str, id: int):

    threshold = {
        "nyc_feed": 4,
    }.get(location, 3.75)

    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        # cur.execute("SELECT * FROM checkins ORDER BY checkin_id DESC LIMIT 25")
        cur.execute(f"""
        SELECT 
            COALESCE(beers.pic, 'https://assets.untappd.com/site/assets/images/temp/badge-beer-default.png') AS pic,
            checkin_id,
            venue_id,
            checkins.created_at AS created,
            beer_id AS bid,
            beer_name,
            venues.lat,
            breweries.brewery_name AS brewery,
            venues.lng as lon,
            rating_count AS checkin_count,
            venue_name AS venue,
            rating_score AS beer_rating,
            beer_style AS beer_style
        FROM checkins
        JOIN venues USING(venue_id)
        JOIN breweries USING (brewery_id)
        JOIN beers USING(beer_id)
        WHERE created_at > now() - INTERVAL '2 day' AND rating_score >= {threshold} AND feed=%s
        """, (location,))
        rows = cur.fetchall()
    last_id = rows[0]["checkin_id"]
    return {"lastID": last_id, "checkins": rows}

@app.get("/Feed/{location}")
def feed(location: str):
    return feed_limit(location, 0)

@app.get("/Feeds")
def feeds():
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("SELECT feed AS name, feed AS id, lat, lon, name AS city FROM feeds")
        return cur.fetchall()

    return [{"name": "nyc", "id": "nyc_feed",  "lat": 40.713342, "lon": -73.945931, "city": "New York"}]
    # return [{"name": "nyc", "lat": 40.714404, "lng": -73.942352, "city": "New York"}]

@app.get("/{path_name:path}")
def feed(request: Request, path_name: str):
    return templates.TemplateResponse("index.html", {"request": request})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000, log_level="debug")