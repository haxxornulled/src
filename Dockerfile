# Use official nginx image (no Node.js, no build tools)
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy your prebuilt static files into the image
COPY dist/global /usr/share/nginx/html/dist/global
COPY FormValidation/Examples /usr/share/nginx/html/FormValidation/Examples
COPY docs /usr/share/nginx/html/docs

# Expose port 80 (nginx default)
EXPOSE 80

# No CMD needed; nginx runs by default 