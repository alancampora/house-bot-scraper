# Use the official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /

# Copy the application files into the working directory
COPY . /

# Install the application dependencies
RUN yarn 

# Define the entry point for the container
CMD ["yarn", "start"]
