const fs = require('fs');

const requestHandler = (req, res) => {
    const url = req.url;
    const method = req.method;
    if (url === '/') {
        res.write('<html>');
        res.write('<head><title>Enter Message</title></head>');
        res.write('<body><form action="/message" method="POST"><input type="text" name="message" /><button type="submit">Send</button></form></body>');
        // changes url to /message due to the action above.
        res.write('</html>');
        return res.end();
        // return is not a 'must', but in order for below codes to not run, need return here to end the function.
    }
    if (url === '/message' && method === 'POST') {
        const body = [];
        req.on('data', (blah) => {
            // my input is changed to encoded message. I need to use Buffer to decode in 'end' event.
            console.log(blah);
            body.push(blah);
        });
        return req.on('end', () => {
            const parseBody = Buffer.concat(body).toString();
            console.log(parseBody);
            const message = parseBody.split('=')[1];
            fs.writeFileSync('message.txt', message, () => {
                res.statusCode = 302;
                res.setHeader('Location', '/');
                return res.end();
            });
        });
    }
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>My First Page</title></head>');
    res.write('<body><h1>Hello from my Node.js Server!</h1></body>');
    res.write('</html>');
    res.end();

}

module.exports = requestHandler;