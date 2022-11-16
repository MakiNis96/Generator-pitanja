import jsonServer from 'json-server';
import http from 'http';
import { config } from "./config.js"
const { backHost, backPort } = config

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser)
server.use(router)

http
  .createServer(
    server
  )
  .listen(backPort, backHost, () => {
    console.log(
      `Server started at http://${backHost}:${backPort}/`
    );
  });