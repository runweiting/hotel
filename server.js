const http = require("http");
const Room = require("./models/room");
// 載入 dotenv
const dotenv = require("dotenv");
// 從 node.js 連線 mongoDB 的寫法
const mongoose = require("mongoose");
// 匯入 config.env
dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

// 1. 連線資料庫
mongoose
  .connect(DB)
  .then(() => {
    console.log("資料庫連線成功");
  })
  .catch((err) => {
    console.log(err.reason, "資料庫連線失敗");
  });

const requestListener = async (req, res) => {
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json",
  };
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  if (req.url == "/rooms" && req.method == "GET") {
    const rooms = await Room.find();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        rooms,
      })
    );
    res.end();
  } else if (req.url == "/rooms" && req.method == "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        // 使用 create 在 Room 新增實例
        const newRoom = await Room.create({
          name: data.name,
          price: data.price,
          rating: data.rating,
        });
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: "success",
            rooms: newRoom,
          })
        );
        res.end();
      } catch (err) {
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            status: "false",
            message: "欄位填寫不正確，或沒有此 ID",
            error: err,
          })
        );
        res.end();
      }
    });
  } else if (req.url == "/rooms" && req.method == "DELETE") {
    const rooms = await Room.deleteMany({});
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        rooms: [],
      })
    );
    res.end();
  } else if (req.url.startsWith("/rooms/") && req.method == "DELETE") {
    const id = req.url.split("/").pop();
    await Room.findByIdAndDelete(id);
    const rooms = await Room.find();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        rooms,
      })
    );
    res.end();
  } else if (req.url.startsWith("/rooms/") && req.method == "PATCH") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const id = req.url.split("/").pop();
        await Room.findByIdAndUpdate(id, {
          name: data.name,
          price: data.price,
          rating: data.rating,
        });
        const rooms = await Room.find();
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: "success",
            rooms,
          })
        );
        res.end();
      } catch (err) {
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            status: "false",
            message: "欄位填寫不正確，或沒有此 ID",
          })
        );
        res.end();
      }
    });
  } else if (req.url == "/rooms" && req.method == "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: "false",
        message: "無此網站路由",
      })
    );
    res.end();
  }
};
const server = http.createServer(requestListener);
server.listen(process.env.PORT);

// 新增資料寫法：搭配 new 運算子產生一個新的實例 instance，裡面物件依照 schema 寫
// const testRoom = new Room({
//   name: "寬敞親子房5",
//   price: 3000,
//   rating: 5,
// });
// testRoom
//   .save()
//   .then(() => console.log("新增資料成功"))
//   .catch((err) => {
//     console.log(err.errors.price.properties.message);
//   });
