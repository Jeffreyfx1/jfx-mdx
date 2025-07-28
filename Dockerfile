FROM node:lts-buster

# Clone your bot repository — replace with your actual repo if needed
RUN git clone https://github.com/jepthertech/JFX-MD-X.git /root/JFX-MD-X

WORKDIR /root/JFX-MD-X

# Install dependencies
RUN npm install && npm install -g pm2 || yarn install --network-concurrency 1

COPY . .

EXPOSE 9090

CMD ["npm", "start"]
