const { createClient } = require("redis");
const client = createClient({ url: process.env.REDIS_URL });

client.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
  try {
    await client.connect();
    console.log("Redis Client Connected");
    await client.set("users", JSON.stringify([]));
  } catch (error) {
    console.log("Redis Client Error", error);
  }
})();

console.log(process.env.REDIS_HOST);
module.exports = client;
