import untappd
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
import re
import sys

creds = json.load(open('.credentials.json'))

client = untappd.Untappd(
    client_id=creds["client_id"],
    client_secret=creds["client_secret"],
    redirect_url='http://localhost:8083',
    user_agent='letmein'
)



hostName = "localhost"
serverPort = 8083

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        code = re.search('code=(.*)', self.path).group(1)
        res = client.oauth.get_access_token(code)
        creds["user_token"] = res
        with open(".credentials.json", "w") as fout:
            print(json.dumps(creds), file=fout)
        sys.exit(0)

webServer = HTTPServer((hostName, serverPort), MyServer)
print(client.oauth.get_auth_url())
webServer.serve_forever()
