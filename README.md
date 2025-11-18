# Remote Executor (REX)

This project aim to be a dynamic endpoint for remote code execution (for example to deploy something on another machine from CI/CD, without having to use SSH to login).

## Installation

### Docker Compose

```sh
version: '3.5'

services:
  rex:
    image: mauricenino/rex
    restart: unless-stopped
    ports:
      - '80:3000'
    volumes:
      - /path/to/scripts:/scripts:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro # Only if you want to control docker containers from rex
    environment:
      REX_SECRET: 'some_secret_token'
```

### Docker

```sh
docker container run -it \
  -p 80:3000 \
  -v /path/to/scripts:/scripts:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -e REX_SECRET="some_secret_token" \
  mauricenino/rex
```

### Shell

```sh
git clone https://github.com/MauriceNino/rex \
  && cd rex \
  && yarn \
  && yarn build \
  && REX_SCRIPT_PATH="/path/to/scripts" REX_SECRET="some_secret_token" yarn start
```

## Usage

In your `REX_SCRIPT_PATH` you can place `.js` files with a structure like so:

```js
// deploy.js
module.exports = ({ route, exec, log }) =>
  route
    .settings({
      sendLogs: true, // Send logs as response to the HTTP call
    })
    .param('service', {
      options: ['rex', 'some_other_service'],
    })
    .param('image', {
      options: ['mauricenino/rex:*'],
    })
    .onCall(async options => {
      const service = options.service.value;
      const image = options.image.value;

      log.info(`Deploying ${service} with image ${image}`);

      await exec(`
        docker image pull ${image} &&\\
        docker compose up -d ${service}
      `);
    });
```

Which you can then call via a simple HTTP call:

```sh
curl --get \
  --data-urlencode "service=rex" \
  --data-urlencode "image=mauricenino/rex:latest" \
  --data-urlencode "secret=some_secret_token" \
  https://rex.mauz.dev/deploy
```

## Options

| Option            | Description                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `REX_SCRIPT_PATH` | The path to the scripts. Normally doesn't need to be adjusted for Docker installs                   |
| `REX_PORT`        | The port to listen on. Defaults to `3000`                                                           |
| `REX_SECRET`      | The secret token to use                                                                             |
| `REX_PRE_LOAD`    | Code to run before the script is loaded to for example add additional dependencies to the container |
