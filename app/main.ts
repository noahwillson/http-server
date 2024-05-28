import * as net from 'net';

const server = net.createServer((socket: { write: (arg0: string) => void; on: (arg0: string, arg1: (data: any) => void) => void; end: () => void; }) => {
    console.log('New connection established');

    socket.on("data", (data: { toString: () => any; }) => {
        const req = data.toString()
        const [requestLine, ...headerLines] = req.split("\r\n");
        const path = requestLine.split(" ")[1];
        const headers = headerLines.reduce((acc: { [x: string]: any; }, line: { split: (arg0: string) => [any, any]; }) => {
            const [key,value] = line.split(": ")
            if(key && value) {
                acc[key] = value
            }
            return acc;
        },{} as Record<string,string>)

        let res;
        if(path === "/"){
            const body = "Welcome to root"
            res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${body.length}\r\n\r\n${body}`;
        }else if(path.startsWith("/echo/")){
            const echoStr = path.slice(6);
            res = `HTTP/1.1 200 OK\r\n\Content-Type: text/plain\r\nContent-length: ${echoStr.length}\r\n\r\n${echoStr}`;
        }else if (path === "/user-agent") {
            const userAgent = headers["User-Agent"] || "Unknown";
            res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
        }
        else {
            res = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n"
        }
        socket.write(res);
        socket.end();
    })

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
