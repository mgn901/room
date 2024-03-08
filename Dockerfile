# stage: deps

FROM node:21.7.0-slim as deps
ARG HUSKY=0
WORKDIR /usr/src/app
# 1. Install deps needed to run the app
RUN apt-get update\
  && apt-get -y install git\
  && apt-get -y clean\
  && rm -rf /var/lib/apt/lists/*
COPY ./package.json .
RUN npm ci --omit=dev --legacy-peer-deps

# stage: builder

FROM node:21.7.0-slim as builder
ARG HUSKY=0
WORKDIR /usr/src/app
# 1. Install dev-dependencies
RUN apt-get update\
  && apt-get -y install --no-install-recommends openssl\
  && apt-get -y clean\
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY ./package.json .
RUN npm ci --legacy-peer-deps
# 2. Copy files needed to build the app
COPY ./prisma ./prisma
COPY ./scripts ./scripts
COPY ./src ./src
COPY tailwind.config.cjs .
COPY tsconfig*.json ./
# 3. Build the app
ENV NODE_ENV=production
RUN npm run prepare\
  && npm run prod:build

# stage: runtime

FROM node:21.7.0-slim as runtime
WORKDIR /usr/src/app
# 1. Install dumb-init
RUN apt-get update\
  && apt-get -y install --no-install-recommends dumb-init openssl\
  && apt-get -y clean\
  && rm -rf /var/lib/apt/lists/*
# 2. Copy files needed to run the app
COPY --chown=node:node --from=builder /usr/src/app/package.json .
COPY --chown=node:node --from=builder /usr/src/app/prisma ./prisma
COPY --chown=node:node --from=builder /usr/src/app/production ./production
COPY --chown=node:node --from=builder /usr/src/app/src/server/prisma-client ./src/server/prisma-client
# 3. Run the app
USER node
EXPOSE 8080
CMD ["dumb-init", "node", "./production/server/index.node.js"]
