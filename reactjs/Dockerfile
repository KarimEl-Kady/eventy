FROM node:22-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

EXPOSE 5173

# Vite must bind to 0.0.0.0 to be reachable outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
