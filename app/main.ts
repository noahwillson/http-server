import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';

const server = net.createServer((socket) => {
    console.log('New connection established');

    socket.on("data", (data) => {
        const req = data.toString();
        const [requestLine, ...headerLines] = req.split("\r\n");
        const path = requestLine.split(" ")[1];
        const headers = headerLines.reduce((acc, line) => {
            const [key, value] = line.split(": ");
            if (key && value) {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, string>);

        let res;
        if (path === "/") {
            const body = "Welcome to root";
            res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${body.length}\r\n\r\n${body}`;
            socket.write(res);
            socket.end();
        } else if (path.startsWith("/echo/")) {
            const echoStr = path.slice(6);
            res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${echoStr.length}\r\n\r\n${echoStr}`;
            socket.write(res);
            socket.end();
        } else if (path === "/user-agent") {
            const userAgent = headers["User-Agent"] || "Unknown";
            res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
            socket.write(res);
            socket.end();
        } else if (path.startsWith("/files/")) {
            const filePath = path.slice(7); // Extract the file path after "/files/"
            const fullPath = path.join('/tmp/data/codecrafters.io/http-server-tester', filePath);

            fs.readFile(fullPath, 'utf8', (err, data) => {
                if (err) {
                    res = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n";
                    socket.write(res);
                    socket.end();
                } else {
                    res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${data.length}\r\n\r\n${data}`;
                    socket.write(res);
                    socket.end();
                }
            });
        } else {
            res = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n";
            socket.write(res);
            socket.end();
        }
    });

    socket.on('end', () => {
        console.log('Connection closed');
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
});

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
server.listen(4221, 'localhost', () => {
    console.log('Server is running on port 4221');
});
