
FROM node:18-alpine

# Set the working directory to /app/server
WORKDIR /app/server

# Copy the package.json and package-lock.json
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the server files
COPY server/ .

# the app run on port 3000 (container listen on this port)
EXPOSE 3000

# Define the command to run the app
CMD ["node", "server.js"]
