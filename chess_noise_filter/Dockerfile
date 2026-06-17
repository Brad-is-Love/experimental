FROM nginx:alpine
COPY . /usr/share/nginx/html
# Remove files not needed by the web browser
RUN rm -f /usr/share/nginx/html/Dockerfile
