import http.server
import socketserver
import requests
import json
import config
import sys

PORT = sys.argv[1]

def send(post_data):
    headers = {"Authorization": "Bearer " + config.key, "Content-Type": "application/json"}
    proxies = {'http': config.proxy, 'https': config.proxy}
    u = 'https://api.openai.com/v1/chat/completions'
    post_data=json.dumps(json.loads( post_data))
    r = requests.post(u,data=post_data, headers=headers, proxies=proxies)
    return r



class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        # 获取请求URL和请求头部
        url = self.path
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        headers = self.headers
        # 构造转发请求
        response = send(post_data)
        # 设置响应头部
        self.send_response(response.status_code)
        for header, value in response.headers.items():
            self.send_header(header, value)
        self.end_headers()
        # 发送响应内容
        self.wfile.write(response.content)

handler = MyHandler

with socketserver.TCPServer(("", PORT), handler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()
