from http.server import SimpleHTTPRequestHandler, HTTPServer
import socketserver
import os

PORT = 8080

class MyHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add no-cache for freshness
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

Handler = MyHandler

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()
