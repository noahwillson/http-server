import * as net from 'net';

const server = net.createServer((socket: { write: (arg0: string) => void; on: (arg0: string, arg1: (data: any) => void) => void; end: () => void; }) => {
    socket.write("HTTP/1.1 200 OK\r\n\r\n");
    socket.on("data", (data: { toString: () => any; }) => {
        const req = data.toString()
        const path = req.split(" ")[1];
        const res = path === "/" ? "HTTP/1.1 200 OK\r\n\r\n" : "HTTP/1.1 404 NOT_FOUND\r\n\r\n"
    })
    socket.end();
});

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
server.listen(4221, 'localhost', () => {
    console.log('Server is running on port 4221');
});
