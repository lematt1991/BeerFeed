import psycopg2

conn = psycopg2.connect("postgres:///beer_feed")


with conn.cursor() as cur:
    cur.execute("""
    CREATE TABLE IF NOT EXISTS beers (
        auth_rating REAL,
        beer_abv REAL,
        beer_name TEXT,
        beer_style TEXT,
        beer_id INT PRIMARY KEY,
        rating_count INT,
        rating_score REAL,
        last_updated TIMESTAMP
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS breweries (
        brewery_id INT PRIMARY KEY,
        brewery_name TEXT,
        brewery_page_url TEXT,
        brewery_slug TEXT,
        brewery_type TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS venues(
        venue_id INT PRIMARY KEY,
        venue_name TEXT,
        venue_slug TEXT,
        lat REAL,
        lng REAL
    )
    """
    )


    cur.execute("""
    CREATE TABLE IF NOT EXISTS checkins (
        beer_id INT references beers(beer_id),
        brewery_id INT references breweries(brewery_id),
        checkin_comment TEXT,
        checkin_id INT PRIMARY KEY,
        created_at TIMESTAMP,
        distance REAL,
        venue_id int references venues(venue_id)
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS tokens (
        token TEXT PRIMARY KEY,
        last_used TIMESTAMP NOT NULL DEFAULT NOW()
    )
    """)

conn.commit()