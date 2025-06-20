### Configuration in docker hub

```bash

# Ensuring image created before to tag it
docker build --platform=linux/amd64 -t sv-ms-auth-recovery-app:v1.0 .

# Login docker
docker login

# Tag and push to docker hub
docker run -p 9000:3000 -d --name sv-ms-auth-session erickepnf18/sv-ms-auth-session:v1.0

docker tag sv-ms-auth-session:latest erickepnf18/sv-ms-auth-session:v1.0
docker push erickepnf18/sv-ms-auth-session:v1.0

# Pull repo
docker pull erickepnf18/app:latest
docker pull erickepnf18//sv-ms-auth-session:v1.0

```

### Configuration to deploy in AWS

```bash
sudo apt update
sudo apt install docker.io -y
sudo dnf install docker -y


# docker version
docker --version

# list images
sudo docker images
# list images id
sudo docker ps -a


# give grant privileges to docker user
sudo usermod -a -G docker $USER

# catch the image of the microservice
sudo docker pull chulde/sv-ms-auth-session:latest

# run application
sudo docker run -p 9000:9000 -it <userhub>/sv-ms-auth-session:latest


# delete the container (force)
sudo docker rmi chulde/sv-ms-auth-session:latest -f
# delete the image
sudo docker rm <id-image>
```

### Connect to AWS instance EC2 - Amazon Linux

```bash
ssh -i "streamverse-aws-keypair.pem" awsstudent@ec2-44-203-2-172.compute-1.amazonaws.com

# Install docker
sudo dnf install docker -y
# status daemon
sudo systemctl status docker
# init
sudo systemctl start docker
# to Running in system
sudo systemctl enable docker
# add grant privileges
sudo usermod -aG docker $USER
# close session and restart
newgrp docker

# pull image
docker pull erickepnf18/app:v1.0

# run app with plataform amd64
docker run --platform linux/amd64 -p 9000:3000 -d --name app-container erickepnf18/app:v1.0

docker run --platform linux/amd64 -p 9000:3000 -d --name sv-ms-auth-sessions erickepnf18/app:v1.0

docker run --platform linux/amd64 -p 9000:3000 -d --name sv-ms-auth-sessions erickepnf18/sv-ms-auth-session:v1.0


```

### Build docker amd64 arquitecture | Local Machine

```bash
docker build --platform linux/amd64 -t erickepnf18/app:v1.0 .
docker push erickepnf18/app:v1.0
```

### Extra confs

```bash
docker rm app-container
docker rmi erickepnf18/app:v1.0 -f


docker run -p 9000:3000 -d --name sv-ms-auth-session erickepnf18/sv-ms-auth-session:v1.0

docker run -it --entrypoint /bin/sh erickepnf18/app:v1.0
ls -lah node_modules/.bin/



# relive
docker logs -f sv-ms-auth-session


# logs in live
docker logs -f app-container

```
