FROM node:22-alpine

WORKDIR /app

# Copy package definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose Vite's port
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev"]
