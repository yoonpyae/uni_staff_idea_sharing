FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci --silent

COPY . .

RUN npm run build -- --configuration production


FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf

# ---- IMPORTANT ----
 
COPY --from=build /app/dist/uni-staff-idea-sharing-client/browser /usr/share/nginx/html


# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]