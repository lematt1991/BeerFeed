import untappd
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
import re
import sys
import psycopg2



creds = json.load(open('.credentials.json'))

client = untappd.Untappd(
    client_id=creds["client_id"],
    client_secret=creds["client_secret"],
    redirect_url='http://localhost:8083',
    user_agent='letmein'
)


conn = psycopg2.connect("postgres:///beer_feed")

hostName = "localhost"
serverPort = 8083

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        code = re.search('code=(.*)', self.path).group(1)
        res = client.oauth.get_access_token(code)

        with conn.cursor() as cur:
            cur.execute("INSERT INTO tokens (token) VALUES(%s)", (res,))
        conn.commit()

        sys.exit(0)

webServer = HTTPServer((hostName, serverPort), MyServer)
print(client.oauth.get_auth_url())
webServer.serve_forever()
