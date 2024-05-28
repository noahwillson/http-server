import { createServer, Socket} from 'net';
import fs from 'fs';

const CRLF = '\r\n';
enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
}
enum HttpHeaderType {
    CONTENT_TYPE = 'Content-Type',
    CONTENT_LENGTH = 'Content-Length',
    HOST = 'Host',
    USER_AGENT = 'User-Agent',
    ACCEPT_ENCODING = 'Accept-Encoding',
    CONTENT_ENCODING = 'Content-Encoding',
}
enum EncodingType {
    GZIP = 'gzip',
}
enum ContentType {
    TEXT_PLAIN = 'text/plain',
    OCTET_STREAM = 'application/octet-stream'
}
enum HttpStatusCode {
    OK = '200 OK',
    NOT_FOUND = '404 Not Found',
    BAD_REQUEST = '400 Bad Request',
    CREATED = '201 Created'
}
enum HttpVersion {
    HTTP_1_1 = 'HTTP/1.1',
}
type HttpHeaders = Map<string, string>;
const parseHeaders = (input: string): HttpHeaders => {
    const headers = new Map<string, string>();
    input.split(CRLF+CRLF)[0].replace(input[0], '').split(CRLF).slice(1).forEach(line => {
        const [key, value] = line.split(': ');
        headers.set(key, value);
    });
    return headers;
}
const encodeHeaders = (headers: HttpHeaders): string => {
    return [...headers.entries()].map(([key, value]) => `${key}: ${value}`).join(CRLF);
}
const createResponse = (httpVersion: HttpVersion, statusCode: HttpStatusCode, headers?: HttpHeaders, body?: string): string => {
    return `${httpVersion} ${statusCode}${headers ? CRLF + encodeHeaders(headers) : ''}${CRLF}${CRLF}${body ?? ''}`;
}
const server = createServer((socket: Socket) => {
    socket.on('data', (data: Buffer) => {
        const input = data.toString().split(CRLF);
        const request = input[0].split(' ');
        const [method, path, httpVersion] = request;
        const pathParts = path.split('/');
        const headers = parseHeaders(data.toString());
        const body = data.toString().split(CRLF+CRLF)[1];
        console.log({method}, {path}, {httpVersion}, {headers}, {pathParts}, {body});
        switch (method) {
            case HttpMethod.GET:
                if (path === '/') {
                    socket.write(createResponse(HttpVersion.HTTP_1_1, HttpStatusCode.OK));
                    break;
                } else if (pathParts.length > 1 && pathParts[1] === 'files') {
                } else if (pathParts.length > 2 && pathParts[1] === 'echo' && headers.get(HttpHeaderType.ACCEPT_ENCODING) === EncodingType.GZIP) {
                    const body = pathParts[2];
                    const responseHeaders = new Map<string, string>();
                    responseHeaders.set(HttpHeaderType.CONTENT_ENCODING, EncodingType.GZIP);
                    responseHeaders.set(HttpHeaderType.CONTENT_TYPE, ContentType.TEXT_PLAIN);
                    responseHeaders.set(HttpHeaderType.CONTENT_LENGTH, body.length.toString());
                    socket.write(createResponse(HttpVersion.HTTP_1_1, HttpStatusCode.OK, responseHeaders, body));
                    break;
                } else if (pathParts.length > 2 && pathParts[1] === 'files') {
                    const fileName = pathParts[2];
                    try {
                        const data = fs.readFileSync(`/tmp/data/codecrafters.io/http-server-tester/${fileName}`, 'utf8');
                        const responseHeaders = new Map<string, string>();
                        responseHeaders.set(HttpHeaderType.CONTENT_TYPE, ContentType.OCTET_STREAM);
                        responseHeaders.set(HttpHeaderType.CONTENT_LENGTH, data.length.toString());
                        socket.write(createResponse(HttpVersion.HTTP_1_1, HttpStatusCode.OK, responseHeaders, data));
                    } catch (err) {
                        socket.write(createResponse(HttpVersion.HTTP_1_1, HttpStatusCode.NOT_FOUND));
                    }
                    break;
                } else if (pathParts.length > 2 && pathParts[2] !== '') {
                    const responseHeaders = new Map<string, string>();
                    responseHeaders.set(HttpHeaderType.CONTENT_TYPE, ContentType.TEXT_PLAIN);
                    responseHeaders.set(HttpHeaderType.CONTENT_LENGTH, pathParts[2].length.toString());
                    socket.write(createResponse(HttpVersion.HTTP_1_1, HttpStatusCode.OK, responseHeaders, pathParts[2]));
                    break;
                } else if (pathParts.length > 1 && pathParts[1] === 'user-agent') {
                    const value = headers.get(HttpHeaderType.USER_AGENT) || '';
                    const responseHeaders = new Map<string, string>();
                    responseHeaders.set(HttpHeaderType.CONTENT_TYPE, ContentType.TEXT_PLAIN);
                    responseHeaders.set(HttpHeaderType.CONTENT_LENGTH, value.length.toString());
                    socket.write(createResponse(HttpVersion.HTTP_1_1, HttpStatusCode.OK, responseHeaders, value));
                    break;
                } else if (path !== '/') {
                    socket.write(createResponse(HttpVersion.HTTP_1_1, HttpStatusCode.NOT_FOUND));
                    break;
                }
            case HttpMethod.POST:
                if (pathParts.length > 2 && pathParts[1] === 'files') {
                    const fileName = pathParts[2];
                    fs.writeFileSync(`/tmp/data/codecrafters.io/http-server-tester/${fileName}`, body, 'utf8');
                    socket.write(createResponse(HttpVersion.HTTP_1_1, HttpStatusCode.CREATED));
                    break;
                }
            default:
                socket.write(`${httpVersion} ${HttpStatusCode.BAD_REQUEST}${CRLF}${CRLF}`);
                return;
        }
    })
});
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
// Uncomment this to pass the first stage
server.listen(4221, 'localhost', () => {
    console.log('Server is running on port 4221');
});