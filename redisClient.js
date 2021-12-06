const { createClient } = require("redis");

const client = createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

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

module.exports = client;
