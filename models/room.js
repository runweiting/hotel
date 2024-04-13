// 1. 從 node.js 連線 mongoDB 的寫法
const mongoose = require("mongoose");
// 2. 自定 schema
const roomSchema = mongoose.Schema(
  {
    // 自己設計的 schema
    name: String,
    price: {
      type: Number,
      required: [true, "價格為必填"],
    },
    rating: Number,
    createdAt: {
      type: Date,
      default: Date.now,
      select: false, // 預設前台不顯示
    },
  },
  {
    // 預設值
    versionKey: false,
  }
);
// 3. 使用 mongoose裡的 model 函式，建立名為 "Room" 的 Modal
const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
