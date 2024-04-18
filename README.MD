# Projet PFE

Il s'agit d'une application backend Node.js pour la gestion des employés, de la présence, des congés et d'autres tâches connexes. Elle communique avec un serveur distant pour accéder et utiliser des ressources.

## Pour Commencer

Ces instructions vous permettront d'obtenir une copie du projet en cours d'exécution sur votre machine locale à des fins de développement et de test.

### Prérequis

- Node.js et npm installés sur votre machine
- MongoDB installé et en cours d'exécution sur votre machine locale
- Accès au serveur distant pour la communication

### Installation

1. Clonez le dépôt sur votre machine locale :


2. Accédez au répertoire du projet :


3. Installez les dépendances à l'aide de npm :


### Exécution du Serveur

Pour exécuter le serveur en utilisant Nodemon, utilisez la commande suivante :


Le serveur redémarrera automatiquement à chaque modification du code source.

4. Accédez à l'application dans votre navigateur Web à [http://localhost:3000](http://localhost:3000).

## Fonctionnalités

- Gestion des employés : Ajouter, modifier, supprimer des employés.
- Suivi de la présence : Enregistrer les données de présence des employés.
- Gestion des congés : Attribuer, modifier, révoquer des congés pour les employés.
- Intégration de WebSocket pour la communication en temps réel avec les clients.
- Statistiques du tableau de bord : Obtenir des informations sur les données des employés.

## Construit Avec

- [Express.js](https://expressjs.com/) - Framework web pour Node.js
- [MongoDB](https://www.mongodb.com/) - Base de données NoSQL
- [Mongoose](https://mongoosejs.com/) - Modélisation d'objets MongoDB pour Node.js
- [WebSocket](https://www.npmjs.com/package/ws) - Bibliothèque WebSocket pour Node.js

## Auteurs

- [Nom de l'auteur](https://github.com/nomdelauteur) - [Optionnel : description ou rôle]

## Licence

Ce projet est sous licence [MIT License](LICENSE).

## Remerciements

- Un grand merci à tous ceux dont le code a été utilisé
- Inspiration
- etc.
