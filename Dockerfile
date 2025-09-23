# Stage 1: Build the application
FROM node:21-alpine as builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

ARG ENV_PROFILE=".env.dev"
ENV ENV_PROFILE=$ENV_PROFILE

RUN echo "Building with profile ${ENV_PROFILE}"

# Install dependencies
RUN corepack enable && pnpm config set registry https://registry.npmmirror.com && pnpm install

# Copy all files
COPY . .

# Build the application
RUN pnpm nuxt build --dotenv ${ENV_PROFILE}

# Stage 2: Production image
FROM node:21-alpine

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/node_modules /app/node_modules

# Environment variables
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

CMD ["node", "/app/.output/server/index.mjs"]