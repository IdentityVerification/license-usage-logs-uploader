ARG NODE_VERSION=14.17-alpine
ARG NODE_ENV
ARG BUILD_FLAG

# -------------------------------------------

# Builder with all NPM dependencies
FROM node:${NODE_VERSION} AS builder

WORKDIR /app/builder
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci

# -------------------------------------------

# Builder without DEV dependencies with optimized node_modules
FROM node:${NODE_VERSION} AS builder-prod

RUN apk --no-cache add curl
RUN curl -sf https://gobinaries.com/tj/node-prune | sh

WORKDIR /app/builder
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci --production
RUN node-prune

# -------------------------------------------

# Builder for building app
FROM node:${NODE_VERSION} AS builder-app

WORKDIR /app/builder
COPY --from=builder /app/builder/node_modules ./node_modules
COPY . .

# -------------------------------------------

# Final stage for production deployment
FROM node:${NODE_VERSION}

RUN npm install -g typescript
RUN npm install -g ts-node

WORKDIR /app
COPY --from=builder-prod /app/builder/node_modules ./node_modules
COPY --from=builder-app /app/builder/src ./src
ENV NODE_ENV=$NODE_ENV

CMD ["ts-node", "--transpile-only", "./src/index.ts"]
