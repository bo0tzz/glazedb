FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies for sharp
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

# DB_URL is required at build time for SvelteKit's static env validation
# The actual runtime value is provided via environment variables
ARG DB_URL=postgresql://localhost/glazedb
ENV DB_URL=$DB_URL

RUN npm run build
RUN npm prune --production

FROM node:22-alpine AS runner

WORKDIR /app

# Sharp requires these at runtime
RUN apk add --no-cache vips-dev

COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "build"]
