import http.server
import socketserver
import socket
import os
import sys

def get_ip():
    """获取本机局域网IP"""
    try:
        # 连接外网地址来获取本机IP（不真发数据）
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
    except:
        ip = "127.0.0.1"
    return ip

def find_free_port(start=8000):
    """查找可用端口"""
    port = start
    while True:
        try:
            with socketserver.TCPServer(("", port), None) as s:
                return port
        except OSError:
            port += 1
            if port > 9000:
                return 0

PORT = find_free_port(8000)
IP = get_ip()

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        """自定义日志，显示访问来源"""
        if self.client_address[0] == IP or self.client_address[0] == '127.0.0.1':
            device = "💻 本机"
        else:
            device = "📱 手机"
        print(f"{device} 访问: {self.path}")

    def end_headers(self):
        # 解决跨域问题，允许手机端调试
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

# 改变工作目录到脚本所在位置（如果拖入文件夹双击运行）
if len(sys.argv) > 1:
    os.chdir(sys.argv[1])

print(f"""
🟢 文件共享服务器已启动！
═══════════════════════════════════
📂 共享目录: {os.getcwd()}
🌐 局域网地址: http://{IP}:{PORT}
💻 本机地址:   http://localhost:{PORT}
═══════════════════════════════════
📱 手机浏览器输入: http://{IP}:{PORT}
⚠️  确保手机和电脑连接同一WiFi
🛑 按 Ctrl+C 停止
═══════════════════════════════════
""")

try:
    with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n\n🔴 服务器已停止")
    sys.exit(0)