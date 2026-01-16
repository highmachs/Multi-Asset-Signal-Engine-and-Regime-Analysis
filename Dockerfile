FROM node:20-bookworm

# Install Python and dependencies
RUN apt-get update && apt-get install -y python3 python3-pip

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY quant_engine/requirements.txt ./quant_engine/

# Install dependencies
# npm ci installs matching lockfile versions including devDependencies needed for build
RUN npm install

# Install Python packages
# --break-system-packages is needed on newer pip versions in managed environments
RUN pip3 install -r quant_engine/requirements.txt --break-system-packages

# Copy source
COPY . .

# Build application (Frontend + Backend)
RUN npm run build

# Expose port
EXPOSE 5000

# Start command
ENV NODE_ENV=production
CMD ["sh", "-c", "npm run db:push && npm start"]
