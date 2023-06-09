# TL;DR

🌴 TL;DR long Discord messages with PaLM

## Setup

### 1. Create a Discord application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application**.
3. Give your application a name and click **Create**.

### 2. Create a bot user

1. Click the **Bot** tab.
2. Click **Add Bot**.
3. Click **Yes, I understand**.

### 3. Get your bot's info

You will need the following information:

- Public key
  - This can be found in **General Information**.
- Client ID
  - This can be found in **OAuth2** under **Client Information**.
- Token
  - This can be found in **Bot** under **Token**.
  - Note: This is a secret and should **_not_** be shared.

### 4. Generate a PaLM API key

> Note: You will need access to the PaLM API to generate an API key.
> You can request access [here](https://makersuite.google.com/waitlist).

- Create a PaLM API key [here](https://makersuite.google.com/app/apikey).

### 5. Create a `.env` file

- Copy the [.env.example](.env.example) file to `.env` and fill in the values.

## Usage

### Development

You will need to use two terminal windows, one for the bot and one for ngrok.

**Note:** You will need to have [ngrok](https://dashboard.ngrok.com/get-started/setup) installed and in your path.

Terminal 1:

```bash
deno task run
```

Terminal 2:

```bash
deno task ngrok
```
