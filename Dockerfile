# Use official Node.js image as base
FROM node:20-alpine

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies including development dependencies
RUN npm install --include=dev

# Copy the rest of the application code to the container
COPY . .

# Build the application
RUN npm run build

# Expose port 8001 to the outside world
EXPOSE 8001

# Command to run the NodeJS app
CMD ["npm", "run", "docker:dev"]

