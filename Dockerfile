# Build static assets
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --ignore-scripts; else npm install --ignore-scripts; fi
COPY public ./public
COPY src ./src
ARG REACT_APP_API_URL=http://localhost:5050
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Serve with nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
