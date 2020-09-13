const tape = require("tape");
const bent = require("bent");
const getPort = require("get-port");
const nock = require("nock");
const server = require("../server");
const distributions = require("./distributions");
const minSecure = require("./minimum-secure");
const latestReleases = require("./latest-releases");

const getJSON = bent("json");
const getBuffer = bent("buffer");

// Use `nock` to prevent live calls to remote services
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
  const html = (await getBuffer(`${context.origin}/dependencies`))
    .toString()
    .replace(/\s+/g, " ");

  const mockDependencies = `<!DOCTYPE html>
    <html lang="en" dir="ltr">

      <head>
        <meta charset="utf-8">
        <title></title>
      </head>

      <body>
        <ul>
          <li>bent - ^7.3.10</li>
          <li>express - ^4.17.1</li>
          <li>hbs - ^4.1.1</li>
          <li>semver - ^7.3.2</li>
        </ul>
      </body>

    </html>`.replace(/\s+/g, " ");

  t.plan(1);
  t.equal(mockDependencies, html);
  t.end();
});

tape("should get minimum secure versions", async function (t) {
  const dists = await getJSON(`${context.origin}/minimum-secure`);
  t.plan(1);
  t.deepEqual(dists, minSecure);
  t.end();
});

tape("should get latest version for each major release", async function (t) {
  const dists = await getJSON(`${context.origin}/latest-releases`);
  t.plan(1);
  t.deepEqual(dists, latestReleases);
  t.end();
});

tape("teardown", function (t) {
  context.server.close();
  t.end();
});
