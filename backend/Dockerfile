FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Start the server
CMD ["npm", "start"]

EXPOSE 3001
