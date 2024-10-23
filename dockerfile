FROM node:20-slim

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Строим проект
RUN npm run build

# Устанавливаем Nginx для обслуживания статических файлов
FROM nginx:alpine

# Копируем собранные файлы в директорию Nginx
COPY --from=0 /app/dist /usr/share/nginx/html

# Указываем, что Nginx будет слушать на 80 порту
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
