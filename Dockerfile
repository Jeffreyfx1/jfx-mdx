# Use official Node.js LTS image
FROM node:lts

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (includes pm2 from your package.json)
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port (optional, only if you're running a web server)
EXPOSE 3000

# Start the bot using pm2 from node_modules
CMD ["npx", "pm2-runtime", "index.js", "--name", "NEXUS-XMD"]
