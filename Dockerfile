# Build stage
FROM node:lts-alpine AS builder

RUN mkdir /app
WORKDIR /app

COPY . .

# install dependencies (https://docs.npmjs.com/cli/v7/commands/npm-ci)
RUN npm ci

# build
RUN npm run build

# Production stage
FROM node:lts-alpine
ENV NODE_ENV=production

RUN mkdir /app \
    && mkdir /app/targets

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/dist dist

# install production dependencies
RUN npm ci \
    && adduser --disabled-password mailform && chown mailform:mailform -R ./

ENV CORS_ORIGIN="*"
ENV ENABLE_PIPEDRIVE=

EXPOSE 7000

USER mailform

CMD ["npm", "start"]
