import * as net from 'net';

const server = net.createServer((socket: { write: (arg0: string) => void; on: (arg0: string, arg1: (data: any) => void) => void; end: () => void; }) => {
    socket.on("data", (data: { toString: () => any; }) => {
        const userAgent = data.toString().split("\r\n")[0].split(" ")
        const req = data.toString()
        const path = req.split(" ")[1];
        let res;
        if(path === "/"){
            const body = "Welcome to root"
            res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${body.length}\r\n\r\n${body}`;
        }else if(path === "/user-agent"){
            const userAgentValue = userAgent.split(": ")[1]
            res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-length: ${userAgentValue.Length}\r\n\r\n${userAgentValue}`
        }else if(path.startsWith("/echo/")){
            const echoStr = path.slice(6);
            res = `HTTP/1.1 200 OK\r\n\Content-Type: text/plain\r\nContent-length: ${echoStr.length}\r\n\r\n${echoStr}`;
        }else {
            res = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n"
        }
        socket.write(res);
        socket.end();
    })
});

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
server.listen(4221, 'localhost', () => {
    console.log('Server is running on port 4221');
});
