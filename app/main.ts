import * as net from 'net';
import * as fs from 'fs';
import { join } from 'path';

const server = net.createServer((socket) => {
    console.log('New connection established');

    socket.on("data", (data) => {
        const req = data.toString();
        const [requestLine, ...headerLines] = req.split("\r\n");
        const path = requestLine.split(" ")[1];

        if (path.startsWith("/files/")) {
            const filePath = path.slice(7); // Extract the file path after "/files/"
            const directoryArg = process.argv.find(arg => arg.startsWith('--directory='));
            if (!directoryArg) {
                console.error('No directory specified.');
                const res = "HTTP/1.1 400 Bad Request\r\nContent-Type: text/plain\r\n\r\nNo directory specified.";
                socket.write(res);
                socket.end();
                return;
            }
            const directoryPath = directoryArg.split('=')[1];
            const fullPath = join(directoryPath, filePath);

            fs.readFile(fullPath, (err, data) => {
                if (err) {
                    console.error(`Error reading file ${filePath}:`, err);
                    const res = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\nFile not found.";
                    socket.write(res);
                    socket.end();
                } else {
                    const contentType = 'application/octet-stream';
                    const contentLength = data.length;
                    const headers = `HTTP/1.1 200 OK\r\nContent-Type: ${contentType}\r\nContent-Length: ${contentLength}\r\n\r\n`;
                    const res = Buffer.concat([Buffer.from(headers), data]);
                    socket.write(res);
                    socket.end();
                }
            });
        } else {
            const res = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\nInvalid request.";
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

console.log("Logs from your program will appear here!");

server.listen(4221, 'localhost', () => {
    console.log('Server is running on port 4221');
});
