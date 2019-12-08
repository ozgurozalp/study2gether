const r = require("rethinkdb");
const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 5000;

// Setup Database
r.connect({ host: "localhost", port: 28015 }, function(err, conn) {
  if (err) throw err;
  r.db("test")
    .tableList()
    .run(conn, function(err, response) {
      if (response.indexOf("edit") > -1) {
        // do nothing it is created...
        console.log("Table exists, skipping create...");
        console.log("Tables - " + response);
      } else {
        // create table...
        console.log("Table does not exist. Creating");
        r.db("test")
          .tableCreate("edit")
          .run(conn);
      }
    });

  // Socket Stuff
  io.on("connection", function(socket) {
    console.log("a user connected");
    socket.on("disconnect", function() {
      console.log("user disconnected");
    });
    socket.on("document-update", function(msg) {
      console.log(msg);
      r.table("edit")
        .insert(
          { id: msg.id, value: msg.value, user: msg.user },
          { conflict: "update" }
        )
        .run(conn, function(err, res) {
          if (err) throw err;
          //console.log(JSON.stringify(res, null, 2));
        });
    });
    r.table("edit")
      .changes()
      .run(conn, function(err, cursor) {
        if (err) throw err;
        cursor.each(function(err, row) {
          if (err) throw err;
          io.emit("doc", row);
        });
      });
  });

  app.get("/getData/:id", (req, res, next) => {
    r.table("edit")
      .get(req.params.id)
      .run(conn, function(err, result) {
        if (err) throw err;
        res.send(result);
        //return next(result);
      });
  });
});

app.get("/", function(req, res) {
  res.send("Özgür Cereni seviyor...");
});

io.on("connection", function(socket) {
  console.log("sokete bağlananlar var");

  socket.on("broadcast", data => {
    console.log(data);
    io.emit("text", {
      text: data.text
    });
  });
});

server.listen(PORT, () => console.log(`${PORT} portunda çalışıyorum.`));
