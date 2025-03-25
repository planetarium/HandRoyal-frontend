FROM nginx:alpine

# Remove default Nginx configuration
RUN rm -rf /usr/share/nginx/html/*

# Copy built app to Nginx server
COPY dist/ /usr/share/nginx/html/

# Copy Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose required port
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"] 