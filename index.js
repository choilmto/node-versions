const server = require("./server");

const PORT = 3000;

server.then((app) => app.listen(PORT)).catch((err) => console.log(err));
