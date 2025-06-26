# Use official Node.js 18 Alpine image
FROM node:18-alpine

ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production --legacy-peer-deps

# Copy source code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "start"] 