const tape = require("tape");
const bent = require("bent");
const getPort = require("get-port");
const nock = require("nock");
const server = require("../server");
const distributions = require("./distributions");

const getJSON = bent("json");
const getBuffer = bent("buffer");

nock("https://nodejs.org")
  .persist()
  .get("/dist/index.json")
  .reply(200, distributions);

const context = {};

tape("setup", async function (t) {
  const port = await getPort();
  const app = await server;
  context.server = app.listen(port);
  context.origin = `http://localhost:${port}`;

  t.end();
});

tape("should get dependencies", async function (t) {
  const html = (await getBuffer(`${context.origin}/dependencies`)).toString();

  t.plan(3);
  t.match(html, /bent/, "should contain bent");
  t.match(html, /express/, "should contain express");
  t.match(html, /hbs/, "should contain hbs");
});

tape("should get minimum secure versions", async function (t) {
  const dists = await getJSON(`${context.origin}/minimum-secure`);

  t.plan(2);
  t.equal(dists.v0.version, "v0.12.17", "v0 version should match");
  t.equal(dists.v4.version, "v4.9.0", "v4 version should match");
});

tape("should get latest version for each major release", async function (t) {
  const dists = await getJSON(`${context.origin}/latest-releases`);

  t.plan(2);
  t.equal(dists.v14.version, "v14.10.1", "v14 version should match");
  t.equal(dists.v13.version, "v13.14.0", "v13 version should match");
});

tape("teardown", function (t) {
  context.server.close();
  t.end();
});
