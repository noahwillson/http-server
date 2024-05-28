import * as net from 'net';
import fs from 'node:fs'; // Import fs with node:fs
import {join} from 'node:path'; // Import path with node:path

const server = net.createServer();
const CLRF = '\r\n';

const createHttpResponse = (statusCode: number, headers?: string[], body?: string) => {
    let response = `HTTP/1.1 ${statusCode} ${getHttpStatusMessage(statusCode)}${CLRF}`;
    if (headers) {
        const stringHeaders = headers.reduce((final, header) => final + header + CLRF, '');
        response += stringHeaders + CLRF;
    } else {
        response += CLRF;
    }
    return `${response}${body || ''}`;
};

const getHttpStatusMessage = (statusCode: number) => {
    // Function remains unchanged
};

server.on('connection', (socket) => {
    socket.on('data', (dataBuf) => {
        const content = dataBuf.toString('utf-8');
        const [startLine, ...headersAndBody] = content.split('\r\n');
        const [_method, path] = startLine.split(/\s/);

        if (path.startsWith('/files/') && _method === 'POST') {
            const [_, __, fileName] = path.split('/');
            const args = process.argv.slice(2);
            const [___, absPath] = args;
            const filePath = join(absPath, fileName); // Use path.join to create the file path

            const fileContent = headersAndBody.join('\r\n');
            fs.writeFile(filePath, fileContent, (err) => {
                if (err) {
                    socket.write(createHttpResponse(500));
                } else {
                    socket.write(createHttpResponse(201));
                }
                socket.end();
            });
        } else {
            socket.write(createHttpResponse(404));
            socket.end();
        }
    });
});

server.listen(4221, 'localhost', () => {
    console.log('Server is running on port 4221');
});
