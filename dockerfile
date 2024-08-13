# Utiliser l'image Node.js officielle
FROM node:16

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste de l'application dans le conteneur
COPY . .

# Exposer le port sur lequel l'API s'exécute
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"]