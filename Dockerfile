FROM node:22.13.1-alpine3.21

# Instalar herramientas necesarias para compilar bcrypt y NestJS CLI
RUN apk add --no-cache python3 make g++ \
    && npm install -g @nestjs/cli

WORKDIR /app

COPY package*.json ./

# Instalar dependencias sin cache y asegurando la compatibilidad
RUN npm install --omit=dev

COPY . .

# Copiar archivo .env (ya que está subido al repo para este caso educativo)
COPY .env .env

# Recompilar bcrypt para la arquitectura correcta
RUN npm rebuild bcrypt --build-from-source

# Exponer el puerto
EXPOSE 3000

# Ejecutar la app
CMD ["npm", "run", "start"]
