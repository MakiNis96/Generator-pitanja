import jsonServer from 'json-server';
import https from 'https';
import fs from 'fs';
import { config } from "./config.js"
const { backHost, backPort, keyFile } = config

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser)

server.get('/korisnici', (req, res, next) => {
  if (req.query.username) {
    return next()
  }
  res.status(403).send()
})
server.get('/odgovori', (req, res) => {
  res.status(403).send()
})

server.use(router)

https
  .createServer(
    {
      key: fs.readFileSync(keyFile || 'privkey.pem'),
      cert: fs.readFileSync('cert.pem'),
    },
    server
  )
  .listen(backPort, backHost, () => {
    console.log(
      `Server started at https://${backHost}:${backPort}/`
    );
  });