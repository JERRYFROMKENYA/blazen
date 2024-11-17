# Use an official Node.js runtime as a parent image
FROM node:22

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 6000
EXPOSE 5000
EXPOSE 8000
EXPOSE 8080
EXPOSE 9090

# Define the command to run the app
CMD ["npm","run","server"]