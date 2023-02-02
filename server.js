import jsonServer from 'json-server';
import https from 'https';
import fs from 'fs';
import { config } from "./config.js"
const { backHost, backPort } = config

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser)
server.use(router)

https
  .createServer(
    {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
    },
    server
  )
  .listen(backPort, backHost, () => {
    console.log(
      `Server started at https://${backHost}:${backPort}/`
    );
  });