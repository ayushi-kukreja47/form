const http = require('http');
const url = require('url');
const fs = require('fs');
const querystring = require('querystring');
const mysql = require('mysql');

const port = 3000;

// Configure MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'form'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.log('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  

  if (pathname === '/') {
    // Serve index.html
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
      }
    });
  } else if (pathname === '/signin' && req.method === 'POST') {
    // Handle SignIn form submission
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { username, password } = querystring.parse(body);

      // Check credentials in the MySQL database
      const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
      db.query(query, (err, result) => {
        if (err) {
          console.log('Error querying database:', err);
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end('Internal Server Error');
        } else {
          if (result.length > 0) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Welcome, ' + username + '!');
          } else {
            res.writeHead(401, {'Content-Type': 'text/plain'});
            res.end('Invalid credentials. Please try again.');
          }
        }
      });
    });
  } else if (pathname === '/signup' && req.method === 'POST') {
    // Handle SignUp form submission
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { newUsername, newPassword } = querystring.parse(body);

      // Insert new entry in the MySQL database
      const insertQuery = `INSERT INTO users (username, password) VALUES ('${newUsername}', '${newPassword}')`;
      db.query(insertQuery, (err, result) => {
        if (err) {
          console.log('Error inserting into database:', err);
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end('Internal Server Error');
        } else {
          res.writeHead(302, {'Location': '/'});
          res.end();
        }
      });
    });
  } else {
    // Handle other routes
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
