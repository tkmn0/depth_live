const express = require("express");
const app = express();
const path = require('path');
const server = app.listen(3000, function () {
    console.log("Node.js is listening to PORT:" + server.address().port);
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get("/", function (req, res, next) {
    res.render("index", {});
});