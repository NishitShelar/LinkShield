# Use official Node.js 18 Alpine image
FROM node:18-alpine

ENV NODE_ENV=production

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"] 