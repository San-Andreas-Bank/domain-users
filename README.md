<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

# 🧩 Domain: Users - Microservices System

This repository contains the `domain-users` subsystem of the **San Andres Bank**, focused on user authentication and session management using microservices architecture.

## 🚀 Overview

This project is built using **NestJS** and **TypeScript**, containerized with **Docker**, and orchestrated using **Docker Compose**. It includes JWT-based authentication, password reset via email (OTP & token), and integration with PostgreSQL.

## 📦 Microservices Included

| Microservice        | Description                            | Language | Tech Stack  |
|---------------------|----------------------------------------|----------|-------------|
| `auth-session`      | Manages login, logout, JWT, sessions   | TypeScript | NestJS + PostgreSQL |

## 🛠 Technologies Used

- **NestJS** (Node.js Framework)
- **TypeScript**
- **PostgreSQL** (via Docker container)
- **Docker & Docker Compose**
- **JWT** (Authentication)
- **Nodemailer** (Email for password recovery)
- **Postman** (API testing)
- **GitHub** (Version control)

## ⚙️ Environment Variables (`.env`)

```env
APP_PORT=3000

# PostgreSQL DB
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=admin123
POSTGRES_DB=ms_auth

# JWT
JWT_SECRET=AncestralFlame
JWT_EXPIRE_TIME=7 days
TOKEN_EXPIRATION_MS=60000

# Email Service (Gmail)
EMAIL_USER=edisonchulde21@gmail.com
EMAIL_PASSWORD=iddboyfjcangogna
JWT_PASSWORD_VERIFICATION_TOKEN_SECRET=password_ancestral_flame
JWT_PASSWORD_VERIFICATION_TOKEN_EXPIRATION_TIME=600000

EMAIL_RESET_PASSWORD_URL=

## 🐳 Docker Compose Setup
Your docker-compose.yml launches two containers: the NestJS app and a PostgreSQL database.

version: '3.8'

services:
  app:
    container_name: ms-auth-session
    build:
      context: .
      dockerfile: Dockerfile
    image: edchulde/ms-auth-session:latest
    restart: always
    env_file: .env
    ports:
      - "9000:3000"
    command: npm run start:dev
    depends_on:
      - db

  db:
    image: postgres:15
    container_name: postgres-auth
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: admin123
      POSTGRES_DB: ms_auth
    ports:
      - "5440:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:



  🧪 Testing the Microservices
Once deployed (locally or in EC2):

✅ Open Postman

✅ Import the collection Lightbuild_Auth_Collection.postman_collection.json

✅ Update the environment variable or base URL to:
http://<YOUR_EC2_PUBLIC_IP>:9000

Example:

http://34.229.92.173:9000/auth/signup

🚀 Deployment on AWS EC2
1. SSH into your EC2:
ssh -i "your-key.pem" ubuntu@<EC2_PUBLIC_IP>

2. Clone the GitHub repo:
git clone https://github.com/San-Andreas-Bank/domain-users.git
cd domain-users

3. Build and start the containers:
docker-compose up --build -d

4. Check containers:
docker ps

🔒 Security Notes
Ensure .env is not committed to GitHub (add it to .gitignore).
Rotate credentials and secrets before moving to production.

👨‍💻 Author
Made by Edison Chulde
Educational project for the course: Distributed Programming - Universidad

✅ CI/CD test: updated on 2025-07-05

