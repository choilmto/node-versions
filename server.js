const util = require("util");
const express = require("express");
const package = require("./package.json");
const hbs = require("hbs");
const bent = require("bent");
const semver = require("semver");

const app = express();
const register = util.promisify(hbs.registerPartials).bind(hbs);
const getJSON = bent("json");

app.set("view engine", "hbs");

app.get("/dependencies", function (req, res) {
  res.render("dependencies", {
    dependencies: Object.entries(package.dependencies).map(
      (dep) => `${dep[0]} - ${dep[1]}`
    ),
  });
});

app.get("/minimum-secure", async function (req, res) {
  const nodeDists = await getJSON("https://nodejs.org/dist/index.json");
  const secureDists = nodeDists
    .filter((dist) => dist.security)
    .map((dist) => dist.version);
  const majors = secureDists.reduce(
    (accumulator, dist) => accumulator.add(semver.major(dist)),
    new Set()
  );
  let minSecureVersions = [];
  for (const major of majors) {
    minSecureVersions.push({
      major: `v${major}`,
      number: semver.maxSatisfying(secureDists, `^${major}`),
    });
  }
  const dists = nodeDists.reduce((accumulator, dist) => {
    accumulator[dist.version] = dist;
    return accumulator;
  }, {});
  const minSecure = minSecureVersions.reduce((accumulator, version) => {
    accumulator[version.major] = dists[version.number];
    return accumulator;
  }, {});
  res.json(minSecure);
});

app.get("/latest-releases", async function (req, res) {
  const nodeDists = await getJSON("https://nodejs.org/dist/index.json");
  const majors = nodeDists.reduce(
    (accumulator, dist) => accumulator.add(semver.major(dist.version)),
    new Set()
  );
  const dists = nodeDists.reduce((accumulator, dist) => {
    accumulator[dist.version] = dist;
    return accumulator;
  }, {});
  const releases = nodeDists.map((dist) => dist.version);
  let latestReleases = {};
  for (const major of majors) {
    const max = semver.maxSatisfying(releases, `^${major}`);
    latestReleases[`v${major}`] = dists[max];
  }
  res.json(latestReleases);
});

const server = register(__dirname + "/views").then(() => app);

module.exports = server;
