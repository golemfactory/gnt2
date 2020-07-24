FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

RUN npm install -g typescript
RUN npm install -g ts-node

RUN yarn install
RUN yarn build

WORKDIR /usr/src/app/gnt2-migration-ui

RUN yarn install
RUN yarn build

EXPOSE 8545
CMD [ "yarn", "start:yagna" ]
