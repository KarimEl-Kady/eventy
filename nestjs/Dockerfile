FROM node:22-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy prisma schema before generating client
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the source
COPY . .

EXPOSE 3000

# Default: run in dev mode (hot-reload via volume mount)
CMD ["npm", "run", "start:dev"]
