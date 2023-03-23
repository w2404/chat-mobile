import http.server
import sys
import ssl
p=sys.argv[1] #证书路径

httpd = http.server.HTTPServer(('0.0.0.0', 443), http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket,keyfile='../server/server.pem', certfile='../server/server.pem', server_side=True)
httpd.serve_forever()
