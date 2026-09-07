# very-chill-cat

A Slack bot that responds to slash commands with cat facts, jokes, and latency checks — running 24/7 on a self-hosted server.

![very-chill-cat in action](./screenshot.png)

<!-- Replace screenshot.png with a real screenshot or GIF of the bot answering commands in Slack.
     Put the image file in the repo root, or in a /docs folder and update the path. -->

## Try it

Add the bot to your workspace: **[Install very-chill-cat](YOUR_INSTALL_LINK_HERE)**

Once installed, type `/very-chill-cat-help` in any channel to see what it can do.

## Features

- `/very-chill-cat-ping` — measures round-trip latency to the Slack API and reports it in milliseconds
- `/very-chill-cat-catfact` — pulls a random cat fact from the [Cat Facts API](https://catfact.ninja)
- `/very-chill-cat-joke` — pulls a random setup-and-punchline joke from the [Official Joke API](https://official-joke-api.appspot.com)
- `/very-chill-cat-help` — lists every available command
- Runs continuously under systemd, so it restarts automatically after a crash or server reboot

## Running it yourself

### Requirements

- Node.js 20 or newer (the `undici` dependency chain relies on the global `File` class, which Node 18 does not expose)
- A Slack app with Socket Mode enabled

### Slack app setup

1. Create an app at [api.slack.com/apps](https://api.slack.com/apps)
2. Under **Socket Mode**, toggle it on and generate an app-level token with the `connections:write` scope — this is your `SLACK_APP_TOKEN` (starts with `xapp-`)
3. Under **OAuth & Permissions**, add the `commands` bot token scope, then install to your workspace. The resulting bot token is your `SLACK_BOT_TOKEN` (starts with `xoxb-`)
4. Under **Slash Commands**, register all four commands listed in Features above
5. Reinstall the app after adding commands, or they won't appear in Slack

### Local setup

```bash
git clone https://github.com/ghx312/slack_bot
cd slack_bot
npm install
```

Create a `.env` file in the project root:

```
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
```

Then start it:

```bash
node index.js
```

You should see `bot is running!`. Try a command in Slack to confirm.

### Deploying

The bot uses Socket Mode, so it holds an outbound WebSocket connection to Slack rather than receiving inbound HTTP requests. That means no public URL, no ngrok tunnel during development, and no reverse proxy in production — it runs anywhere with outbound internet access.

This instance runs on [Hack Club Nest](https://nest.hackclub.com) as a systemd service:

```ini
[Unit]
Description=Slack Bot
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
Restart=always
RestartSec=5
WorkingDirectory=/root/slack_bot
EnvironmentFile=/root/slack_bot/.env
ExecStart=/usr/bin/node index.js

[Install]
WantedBy=multi-user.target
```

Save as `/etc/systemd/system/slackbot.service`, then:

```bash
systemctl daemon-reload
systemctl enable --now slackbot.service
journalctl -u slackbot.service -f
```

`Restart=always` means a crash or reboot brings the bot back on its own within five seconds.

## How it works

Slack bots normally receive events as inbound HTTP POSTs, which requires a publicly reachable URL and TLS. Socket Mode inverts this: the bot opens a WebSocket to Slack and events arrive over that connection. The tradeoff is that the process must stay alive to receive anything — there's no queue holding events while it's down — which is why the systemd unit above matters more than it would for a webhook-based bot.

Every handler calls `ack()` before doing any other work. Slack expects acknowledgement within three seconds and shows the user an operation-timeout error otherwise, so the external API calls for cat facts and jokes happen after the ack rather than before it.

## Built with

- [Bolt for JavaScript](https://tools.slack.dev/bolt-js/) — Slack's official app framework
- [axios](https://axios-http.com) — HTTP client for the external APIs
- [dotenv](https://github.com/motdotla/dotenv) — environment variable loading

Cat facts from [catfact.ninja](https://catfact.ninja). Jokes from the [Official Joke API](https://github.com/15Dkatz/official_joke_api).

Built for [Stardance](https://stardance.hackclub.com), hosted on [Hack Club Nest](https://nest.hackclub.com).
