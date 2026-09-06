require("dotenv").config();

const { App } = require("@slack/bolt");
const axios = require("axios");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/very-chill-cat-ping", async ({ ack, respond }) => {
  await ack();
  const start = Date.now();
  await app.client.auth.test();
  await respond({ text: `Pong!\nLatency: ${Date.now() - start}ms` });
});

app.command("/very-chill-cat-catfact", async ({ ack, respond }) => {
  await ack();
  try {
    const res = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `Cat Fact:\n${res.data.fact}` });
  } catch (err) {
    console.error("catfact failed:", err.message);
    await respond({ text: "Failed to fetch a cat fact." });
  }
});

app.command("/very-chill-cat-joke", async ({ ack, respond }) => {
  await ack();
  try {
    const res = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({ text: `${res.data.setup}\n\n${res.data.punchline}` });
  } catch (err) {
    console.error("joke failed:", err.message);
    await respond({ text: "Failed to fetch a joke." });
  }
});

app.command("/very-chill-cat-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text: `Available Commands:
/very-chill-cat-ping - Check bot latency
/very-chill-cat-catfact - Get a cat fact
/very-chill-cat-joke - Get a joke
/very-chill-cat-help - Show this message`
  });
});

app.error(async (error) => {
  console.error("Bolt error:", error);
});

(async () => {
  try {
    await app.start();
    console.log("bot is running!");
  } catch (err) {
    console.error("failed to start:", err);
    process.exit(1);
  }
})();