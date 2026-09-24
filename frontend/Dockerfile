# Stage 1: Build React static assets
# Stage 1: Build React static assets
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG VITE_SMS_OTP_ENABLED=false
ARG VITE_MAPTILER_API_KEY=
ENV VITE_SMS_OTP_ENABLED=${VITE_SMS_OTP_ENABLED}
ENV VITE_MAPTILER_API_KEY=${VITE_MAPTILER_API_KEY}

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]