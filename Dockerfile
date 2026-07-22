# Étape 1 : build Angular
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : image finale avec Nginx
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf && \
    chown -R nginx:nginx /etc/nginx /var/cache/nginx /var/run
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist/my-app/browser /usr/share/nginx/html
EXPOSE 80
USER nginx
CMD ["nginx", "-g", "daemon off;"]
