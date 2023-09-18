# Builder image
FROM node:20 as builder

WORKDIR /build

COPY "./" "/build/"

# Install, add to path and build
RUN yarn install
RUN PATH="./node_modules/.bin:$PATH"
RUN yarn build

# Re-install node_modules in production mode
RUN rm -rf node_modules
RUN yarn install --production

# ===============
# Runtime image
FROM node:20-alpine as runtime

WORKDIR /app/

## Copy the necessary files form builder
COPY --from=builder "/build/" "/app/"

WORKDIR /app/gnt2-docker-yagna
ENV NODE_ENV=production
CMD ["yarn", "start"]
