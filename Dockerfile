FROM node:22.13.1-alpine3.21

# Instalar herramientas necesarias para compilar bcrypt y NestJS CLI
RUN apk add --no-cache python3 make g++ \
    && npm install -g @nestjs/cli

WORKDIR /app

COPY package*.json ./

# Instalar dependencias sin cache y asegurando la compatibilidad
RUN npm install --omit=dev

COPY . .

# Recompilar bcrypt para la arquitectura correcta
RUN npm rebuild bcrypt --build-from-source

# Construir la aplicación (si es necesario)
# RUN npm run build

# Exponer el puerto en el que la app correrá dentro del contenedor
EXPOSE 3000

# Comando por defecto al iniciar el contenedor
CMD ["npm", "run", "start"]