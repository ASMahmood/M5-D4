const express = require("express");
const projectRoutes = require("./projects");
const uploadRoutes = require("./files");
const {
  notFoundHandler,
  unauthorizedHandler,
  forbiddenHandler,
  badRequestHandler,
  catchAllHandler,
} = require("./errorHandling");

const server = express();
const port = 6969;

server.use(express.json());
server.use("/projects", projectRoutes);
server.use("/projects/:id", uploadRoutes);

server.use(notFoundHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(badRequestHandler);
server.use(catchAllHandler);

server.listen(port, () => {
  console.log("PeepoRun at port: ", port);
});
