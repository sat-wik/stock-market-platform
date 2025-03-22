FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Run migrations and start the server
CMD ["sh", "-c", "npm run migrate && npm start"]

EXPOSE 3001
