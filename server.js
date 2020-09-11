const util = require("util");
const express = require("express");
const package = require("./package.json");
const hbs = require("hbs");

const app = express();
const register = util.promisify(hbs.registerPartials).bind(hbs);

app.set("view engine", "hbs");

app.get("/dependencies", function (req, res) {
  res.render(
    "dependencies",
    {
      dependencies: Object.entries(package.dependencies).map(
        (dep) => `${dep[0]} - ${dep[1]}`
      ),
    },
    function (err, html) {
      if (err) {
        console.log(err);
        res.writeHead(503);
        res.end();
        return;
      }
      res.send(html);
    }
  );
});

const server = register(__dirname + "/views").then(() => app);

module.exports = server;
