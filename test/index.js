const tape = require("tape");
const bent = require("bent");
const getPort = require("get-port");

const server = require("../server");

const getJSON = bent("json");
const getBuffer = bent("buffer");

// Use `nock` to prevent live calls to remote services

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

  t.equal(mockDependencies, html);
});

// more tests

tape("teardown", function (t) {
  context.server.close();
  t.end();
});
