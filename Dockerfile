# Use official Node.js image as base
FROM node:20-alpine

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Copy the rest of the application code to the container
COPY . .

# Expose port 8001 to the outside world
EXPOSE 8001

# Command to run the React app
CMD ["npm", "run", "dev"]

