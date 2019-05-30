const fs = require('fs');
// this function creates txt file called, hello, and writes text that is in the second arugment.
// fs.writeFileSync('hello.txt', 'hello-node.js');

const routeListener = (req, res) => {
    const url = req.url;
    const method = req.method;

    if (url === '/') {
        res.setHeader('Content-Type', 'text/html')
        res.write('<html>');
        res.write('<head><title>Username</title></head>');
        res.write(`<body>
            <h1>enter username</h1>
            <form action="/create-user" method="POST">
                <input type="text" name="username" placeholder="username" />
                <button type="submit">ADD</button>
            </form>
            </body>
        `);
        res.write('</html>');
        return res.end();
    }
    if (url === '/users') {
        res.setHeader('Content-Type', 'text/html')
        res.write('<html>');
        res.write('<head><title>Users</title></head>');
        res.write('<body><ul><li>User 1</li></ul></body>');
        res.write('</html>');
        return res.end();
    }
    if (url === '/create-user' && method === "POST") {
        const body = [];
        console.log(method);
        req.on('data', (data) => {
            body.push(data)
        });
        req.on('end', () => {
            const parseBody = Buffer.concat(body).toString();
            console.log(parseBody.split('=')[1]);
        });
        res.statusCode = 302;
        res.setHeader('Location', '/');
        res.end();
    }
    
}

module.exports = routeListener;