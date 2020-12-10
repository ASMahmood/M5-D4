const express = require("express");
const projectRoutes = require("./projects");
const { join } = require("path");

const {
  notFoundHandler,
  unauthorizedHandler,
  forbiddenHandler,
  badRequestHandler,
  catchAllHandler,
} = require("./errorHandling");

const server = express();
const port = 6969;
const publicFolderPath = join(__dirname, "../public");

server.use(express.json());
server.use(express.static(publicFolderPath));

server.use("/projects", projectRoutes);

server.use(notFoundHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(badRequestHandler);
server.use(catchAllHandler);

server.listen(port, () => {
  console.log("PeepoRun at port: ", port);
});
