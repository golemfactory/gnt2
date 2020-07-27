FROM node:12 as builder

WORKDIR /build

COPY "./" "/build/"
# Remove un-used project. Can be removed after gnt2-docker-yagna is build as a vendor package
RUN rm -rf ./gnt2-migration-ui

RUN yarn install
RUN PATH="./node_modules/.bin:$PATH"
RUN yarn build

RUN rm -rf node_modules
RUN yarn install --production

# ===============
# the second image use node:slim image as the runtime
FROM node:12-slim as runtime

WORKDIR /app/gnt2-docker-yagna
ENV NODE_ENV=production

## Copy the necessary files form builder
COPY --from=builder "/build/" "/app/"

EXPOSE 8545
CMD ["yarn", "start"]
