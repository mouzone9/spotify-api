# README

## Configuration de l'API Spotify

### Étape 1: Créer un compte Spotify

Si vous n'avez pas déjà un compte Spotify, vous devez en créer un. Vous pouvez le faire en visitant le [site web de Spotify](https://www.spotify.com/).

### Étape 2: Créer une application avec le tableau de bord Spotify

Une fois que vous avez un compte Spotify, vous devez créer une application via le tableau de bord Spotify. Pour ce faire, suivez les étapes ci-dessous:

1. Connectez-vous à votre compte Spotify sur le [tableau de bord des développeurs Spotify](https://developer.spotify.com/dashboard/).
2. Cliquez sur le bouton `Create an App`.
3. Remplissez le formulaire avec les détails de votre application (nom, description, etc.) et cliquez sur `Create`.
4. Vous serez redirigé vers le tableau de bord de votre application où vous pouvez voir votre `Client ID` et `Client Secret`.

### Étape 3: Définir une URI de redirection

Dans le tableau de bord de votre application, vous devez définir une URI de redirection. C'est l'URL où Spotify redirigera les utilisateurs après qu'ils se soient connectés avec succès. Pour définir une URI de redirection, suivez les étapes ci-dessous:

1. Dans le tableau de bord de votre application, cliquez sur `Edit Settings`.
2. Sous `Redirect URIs`, ajoutez l'URI de redirection que vous souhaitez utiliser (par exemple, `http://localhost:3000/callback`) et cliquez sur `Add`.
3. Cliquez sur `Save` pour enregistrer vos modifications.

### Étape 4: Configurer l'application

Maintenant que vous avez votre `Client ID`, `Client Secret` et `Redirect URI`, vous devez les ajouter à votre application. Pour ce faire, suivez les étapes ci-dessous:

1. Crée un fichier `.env` dans votre éditeur de code a la racine.
2. Remplacez les valeurs de `CLIENT_ID`, `CLIENT_SECRET` et `REDIRECT_URI` par les valeurs que vous avez obtenues à partir du tableau de bord de votre application Spotify.
3. Enregistrez vos modifications et fermez le fichier.

Maintenant, votre application est prête à être utilisée avec l'API Spotify.

## Installation des dépendances

Avant de pouvoir exécuter l'application, vous devez installer les dépendances. Pour ce faire, ouvrez un terminal à la racine du projet et exécutez la commande suivante :

```bash
npm install
npm start