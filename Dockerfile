FROM node:22-alpine3.19 AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:22-alpine3.19 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./
COPY .env ./.env

RUN npm install --omit=dev

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/views ./views

CMD ["node", "dist/main"]
