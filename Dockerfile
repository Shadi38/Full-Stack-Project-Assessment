# FROM node:18-alpine
# WORKDIR /app/server
# COPY package*.json ./

# RUN npm install
# COPY /server .
# CMD ["node","server.js"]
FROM node:18-alpine

# Set the working directory to /app/server
WORKDIR /app/server

# Copy the package.json and package-lock.json
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the server files
COPY server/ .

# Expose port 3000
EXPOSE 3000

# Define the command to run your app
CMD ["node", "server.js"]
