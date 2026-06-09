### Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Install deps and build
COPY frontend-react/package*.json ./
RUN npm ci
COPY frontend-react/ ./
RUN npm run build

### Production stage (nginx)
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Remove default nginx config if necessary and use default static serve
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
