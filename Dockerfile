# BASE #
FROM node:18-alpine AS base

WORKDIR /app

# BUILD #
FROM base as build

ARG BUILDHASH
ARG VERSION

COPY . ./

RUN \
  /bin/echo -e "{\"version\":\"$VERSION\",\"buildhash\":\"$BUILDHASH\"}" > /app/version.json &&\
  yarn --immutable --immutable-cache &&\
  yarn build

# PROD #
FROM base as prod

ENV REX_SCRIPT_PATH="/scripts"

RUN \
  apk update &&\
  apk --no-cache add docker docker-cli-compose

COPY --from=build /app/package.json /app/version.json ./
COPY --from=build /app/.yarn/releases .yarn/releases
COPY --from=build /app/dist/index.js dist/index.js

EXPOSE 3000

CMD ["yarn", "start"]