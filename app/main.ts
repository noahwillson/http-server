import * as net from 'net';
import fs from 'node:fs';
const server = net.createServer();
const CLRF = '\r\n'
const createHttpResponse = (startLine: string, headers?: string[], body?: string) => {
    let response = startLine + CLRF;
    if (headers) {
        const stringHeaders = headers.reduce((final, header) => final + header + CLRF , '')
        response += stringHeaders + CLRF;
    } else {
        response += CLRF
    }
    return `${response}${body || ''}`;
}
const getStringByteLength = (string: string | undefined) => {
    return Buffer.byteLength(string || '','utf-8')
}
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
// Uncomment this to pass the first stage
server.listen(4221, 'localhost', () => {
    console.log('Server is running on port 4221');
});
server.on('connection', (socket) => {
    socket.on('data', (dataBuf) => {
        const content = dataBuf.toString('utf-8');
        const [startLine, ...headersAndBody] = content.split('\r\n');
        const [_method, path] = startLine.split(/\s/)
        if(path === '/') {
            socket.write(createHttpResponse('HTTP/1.1 200 OK'));
            //socket.write("HTTP/1.1 200 OK\r\n\r\n");
        } else if(path === '/user-agent'){
            const headers = headersAndBody.slice(0,-1);
            const userAgent = headers.find(header => header.startsWith('User-Agent'))?.split(':')?.[1].replace(/\s/,'');
            console.log('userAgent :>> ', userAgent);
            console.log('getStringByteLength :>> ', getStringByteLength(userAgent));
            const response = createHttpResponse('HTTP/1.1 200 OK', ['Content-Type: text/plain', `Content-Length: ${getStringByteLength(userAgent)}`], userAgent ?? '')
            socket.write(response)
        } 
        else if(path.startsWith('/echo/')) {
            const [_, __, segment] = path.split('/');
            const response = createHttpResponse('HTTP/1.1 200 OK', ['Content-Type: text/plain', `Content-Length: ${segment.length}`], segment)
            socket.write(response)
        }  
        else if(path.startsWith('/files/')) {
            const [_, __, fileName] = path.split('/');
            const args = process.argv.slice(2);
            const [___,absPath] = args;
            const filePath = absPath + '/' + fileName
            console.log('filePath :>> ', filePath);
            try {
                const content = fs.readFileSync(filePath).toString();
                const response = createHttpResponse('HTTP/1.1 200 OK', ['Content-Type: application/octet-stream', `Content-Length: ${content.length}`], content)
                socket.write(response)
            } catch(e) {
                console.log('e :>> ', e);
                const response = createHttpResponse('HTTP/1.1 404 Not Found')
                socket.write(response)
            }
        }
        else {
            socket.write(createHttpResponse('HTTP/1.1 404 Not Found'));
            // socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
        socket.end();
    })
    // socket.write("HTTP/1.1 200 OK\r\n\r\n");
    // socket.end();
})

console.log("Logs from your program will appear here!");

server.listen(4221, 'localhost', () => {
    console.log('Server is running on port 4221');
});
