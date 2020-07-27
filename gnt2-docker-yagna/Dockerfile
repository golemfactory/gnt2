# Builder image
FROM node:12 as builder

WORKDIR /build

COPY "./" "/build/"
# Remove un-used project. Can be removed after gnt2-docker-yagna is build as a vendor package
RUN rm -rf ./gnt2-migration-ui

# Install, add to path and build
RUN yarn install
RUN PATH="./node_modules/.bin:$PATH"
RUN yarn build

# Re-install node_modules in production mode
RUN rm -rf node_modules
RUN yarn install --production

# ===============
# Runtime image
FROM node:12-alpine as runtime

WORKDIR /app/

## Copy the necessary files form builder
COPY --from=builder "/build/" "/app/"

WORKDIR /app/gnt2-docker-yagna
ENV NODE_ENV=production
EXPOSE 8545
CMD ["yarn", "start"]
