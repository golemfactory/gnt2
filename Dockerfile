# Builder image
FROM node:20-alpine as builder

RUN npm install -g pnpm
WORKDIR /build

COPY . /build
# Install, add to path and build
RUN pnpm install
RUN pnpm build

# Re-install node_modules in production mode
RUN rm -rf node_modules
RUN pnpm install --production

# ===============
# Runtime image
FROM node:20-alpine as runtime
RUN npm install -g pnpm
WORKDIR /app

## Copy the necessary files form builder
COPY --from=builder /build /app

WORKDIR /app/gnt2-docker-yagna
ENV NODE_ENV=production
CMD ["pnpm", "start"]
