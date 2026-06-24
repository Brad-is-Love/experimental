FROM nginx:alpine
COPY index.html style.css app.js spec.md /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
