import 'dotenv/config';
import express from 'express';
import { Server } from 'socket.io';

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import helmet from 'helmet';
import cors from 'cors';

import session from 'express-session';
import MongoStore from 'connect-mongo';
import MongoClient from './src/db/client-mongo.js';

import { renderView } from './src/renderView.js';
import { inscription } from './src/inscription.js';
import { connection } from './src/connection.js';
import { findOneData } from './src/db/findOneData.js'

/**
 * Gestion HTTP
 */

const app = express();
const port = String(process.env.PORT);
const host = String(process.env.HOST);
const mongoUrl = String(process.env.MONGOURL);
const dbName = String(process.env.DBNAME);
const privateKey = String(process.env.PRIVATEKEYJWT);
// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());
// Middleware pour les données URL encodées
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(cors());

// Obtenir le chemin du fichier en utilisant import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'pug');

// Définition de l'en-tête Content-Security-Policy pour autoriser le chargement de fichiers CSS et JS depuis n'importe quel domaine via HTTP
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' http:; style-src 'self' http:");
  next();
});

app.use('/style', express.static(path.join(__dirname, 'public', 'styles')));
app.use('/script', express.static(path.join(__dirname, 'public', 'scripts'), {
  setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
          res.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
      }
  }
}));
app.use('/image', express.static(path.join(__dirname, 'public', 'assets', 'img')));
app.use('/audio', express.static(path.join(__dirname, 'public', 'assets', 'audios')));
app.use('/font', express.static(path.join(__dirname, 'public', 'assets', 'fonts')));


// Gestion des sessions
// Créer une instance de MongoStore (connect-mongo)
const sessionStore = MongoStore.create({
  mongoUrl: `${mongoUrl}/${dbName}`, // URL de connexion à MongoDB
  // collectionName: 'sessionsMultiplayers',
  ttl: 2 * 60 * 60 * 60, // Durée de vie des sessions en secondes
});


app.use(session({
  secret: 'pacman_secret_player',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 60000
  }
}));

app.get('/', (req, res, next) => {
  return renderView(req, res, next, 'index', {
    title: 'Aurore Sifflet | Jeu multijoueur',
  });
});

app.get('/jeu-monojoueur', (req, res, next) => {
  return renderView(req, res, next, 'monoplayer', {
    title: 'Aurore Sifflet | Jeu monojoueur',
  });
});
app.get('/jeu-multijoueur', (req, res, next) => {
  if (req.session.user) {
    return renderView(req, res, next, 'multiplayer', {
      title: 'Aurore Sifflet | Jeu multijoueur',
      session: req.session.user
    });
  } else {
    console.log('Aucun utilisateur connecté.');
    return res.redirect('/');
  }
});

app.get('/contact', (req, res, next) => {
  return renderView(req, res, next, 'aurore-sifflet_cv', {
    title: 'Aurore Sifflet | D&eacute;veloppeuse Full Stack',
  });
});

app.route('/inscription')
  .get((req, res, next) => {
    return renderView(req, res, next, 'subscribe', {
      title: 'Aurore Sifflet | Inscription',
    });
  })
  .post(async (req, res) => {
    const subscribeResult = await inscription(req, res);
    return res.json(subscribeResult);
  });

app.route('/connexion')
  .get((req, res, next) => {
    return renderView(req, res, next, 'connexion', {
      title: 'Aurore Sifflet | Connexion',
    });
  })
    .post(async (req, res) => {
    const notificationMessage = await connection(req, res);
    return res.json(notificationMessage);
  });
  
  app.get('/deconnexion', (req, res) => {
    req.session.destroy((err) => {    
      if (err) {
        console.error(err);
        res.status(500).send('Erreur de déconnexion');
      } else {
        // Suppression du cookie de session côté client
        res.clearCookie('connect.sid');
        res.send('Déconnecté avec succès');
      }
      return res.redirect('/');
    });
  });

// app.get('/profil', checkAuthentication, (req, res, next) => {
//   if (!isAuthenticated) return res.status(401).send('Non authentifié');
//   jwt.verify(token, privateKey, (err, decoded) => {
//       if (err) return res.status(401).send('Token invalide');
//       //res.send(`Bienvenue, utilisateur ID: ${decoded.nickname}`);
//       return renderView(req, res, next, 'profil', {
//         title: 'Aurore Sifflet | Profil',
//         nickname: decoded.nickname
//       });
//   });
// });

app.route('*')
.all((req, res, next) => {
  return renderView(req, res, next, '404', {
    title: 'Page introuvable',
    backlink: `http://${host}:${port}/`
  });
});

// Middleware d'erreur global
app.use((err, req, res, next) => {
  console.error((new Date()).toLocaleString('fr-FR'), ' Erreur sur le chargement de la vue : ', err);
  res.status(500).send('Une erreur est survenue');
});

const httpServer = app.listen(port, host, () => {
  console.log(`Server started at ${host}:${port}`);
});


/**
 * Gestion WebSocket
 */
const ioServer = new Server(httpServer);
const allPlayers = {};
let playerForThisConnection = {
  x: 0,
  y: 0
};

ioServer.on('connection', (socket) => {
  console.log(`connecté au client ${socket.id} `);
  
  /*** GESTION DES COOKIES ***/
  // Envoyer le cookie avec la connexion Socket.IO
  let cookie = socket.request.headers.cookie;
  ioServer.emit('cookie', cookie);

  
  /*** GESTION DES UTILISATEURS : ***/
  // Utilisation du nickname du localStorage pour chercher les données utilisateurs en db
  socket.on('findDataInLocalStorage', async (nickname) => {
    try {
      const userDBFind = await findOneData(
        String(process.env.DBNAME),
        'users',
        { nickname: nickname },
        { scoreBest: 1, playingTime: 1, id: 1, _id: 0 }
      );
      if(userDBFind) {
        playerForThisConnection = {
          id: userDBFind.id,
          nickname,
          scoreCurrentGame: 0,
          scoreBest: userDBFind.scoreBest,
          playingTime: userDBFind.playingTime
        }
        allPlayers[playerForThisConnection.id] = playerForThisConnection;
        /*** GESTION RUBRIQUE JOUEURS création pour chaque player de:  nickname : scoreCurrentGame ***/
        ioServer.emit('scoreBoard', allPlayers); 
        ioServer.emit('insertDataInLocalStorage', playerForThisConnection);
      }
    } catch (error) { 
      console.error((new Date()).toLocaleString('fr-FR'), ' Erreur sur la fonction findOneData à la création d\'un joueur dans localStorageData : ', error);
    }  
  });

  
  /*** GESTION DU CURSOR marquer le nickname près du cursor ***/
  socket.on('mouseCoordinatesAndNickname', (positionsNickname) => {
    if ( ! isNaN(positionsNickname.x) && ! isNaN(positionsNickname.y) ) {
      for(const id in allPlayers) {
        if (positionsNickname.nickname === allPlayers[id].nickname) {
          allPlayers[id].x = positionsNickname.x;
          allPlayers[id].y = positionsNickname.y;
        } 
        ioServer.emit('createOrUpdatePlayerCursor', allPlayers[id]);
      }
    }
  });

  /*** GESTION DU FOND DE COULEUR ALEATOIRE SE TROUVANT DERRIERE LE MOT ALÉATOIRE ***/

  /**
   * Object colorsBackgroundColor : contient des objets qui spécifient une couleurs de fond
   * @typedef {Object{Object}} colorsBackgroundColor objet ayant comme propriétés des objets randomColorKey
   * @property {randomColorKey} randomColorKey propriété contenant un objet 
   * 
   * Objet randomColorKey
   * @typedef {Object} randomColorKey
   * @property {string} backgroundColor couleur de fond se trouvant derriere le mot aléatoire
   */
  const colorsBackgroundColor = {
    blueStar: { 
      backgroundColor: 'rgb(17, 60, 252)',
    },
    yellowSquare: { 
      backgroundColor: 'rgb(241, 255, 110)',
    },
    redTriangle: { 
      backgroundColor: 'rgb(231, 72, 99)',
    },
    greenCircle: { 
      backgroundColor: 'rgb(52, 180, 0)',
    }
  };
  
  /**
  * @type {function} createRandomColorKeys() Sélectionner aléatoirement une clé de l'un des objets, qui est l'une des propriétés de l'objet wordsColorAndForm
  * @param {string[]} colorsKeys // tableau de toutes les clés de l'objet colorsBackgroundColor ['blueStar', 'yellowSquare', ...]
  * @return {string} randomColorKey // représente une clé aléatoirement sélectionnée dans le tabeau colorsKeys
  */
  // let randomColorKey;
  const colorsKeys = Object.keys(colorsBackgroundColor);
  const createRandomColorKeys = (colorsKeys) => {
    const randomColorKey = colorsKeys[Math.floor(Math.random() * colorsKeys.length)];
    return randomColorKey;
  }
  
  /**
   * Function getRandomColor() : pour obtenir le fond de couleur sélectionné 
   * @param {string} randomColorKey // Clé d'un des objets de l'objet colorsBackgroundColor exemple : 'blueStar'
   * @return {string} // Retourne un fond de couleur qui se trouvera derriere le mot aléatoire
   */
  const getRandomColor = (randomColorKey) => {
    return colorsBackgroundColor[randomColorKey].backgroundColor;
  }
 
  /*** GESTION DES MOTS ALEATOIRES ***/
  /**
   * Object wordsColorAndForm : contient des objets ayant comme propriété une couleur et une forme
   * @typedef {Object{Object}} wordsColorAndForm objet ayant comme propriétés des objets randomWordKey
   * @property {randomWordKey} randomWordKey propriété contenant un objet 
   * 
   * Oobjet randomWordKey ayant comme propriétés des valeurs textuelles.
   * @typedef {Object} randomWordKey
   * @property {string} text1 couleur
   * @property {string} text2 forme
   */
    const wordsColorAndForm = {
      blueStar: { 
        text1: 'Bleu',
        text2: 'Étoile',
      },
      yellowSquare: { 
        text1: 'Jaune',
        text2: 'Carré' 
      },
      redTriangle: { 
        text1: 'Rouge',
        text2: 'Triangle' 
      },
      greenCircle: { 
        text1: 'Vert',
        text2: 'Cercle' 
      }
    };
 
  /**
  * @type {function} createRandomKeys() Sélectionner aléatoirement une clé de l'un des objets, qui est l'une des propriétés de l'objet wordsColorAndForm
  * @param {string[]} keys // tableau de toutes les clés de l'objet wordsColorAndForm
  * @return {string} randomWordKey // représente une clé aléatoirement sélectionnée dans le tabeau keys
  */
  // let randomWordKey;

  const keys = Object.keys(wordsColorAndForm);
  const createRandomKeys = (keys) => {
    const randomWordKey = keys[Math.floor(Math.random() * keys.length)];
    return randomWordKey;
  }




   /**
   * Function getRandomText() : pour obtenir aléatoirement text1 ou text2
   * @param {string} wordKey // Clé d'un des objets de l'objet wordsColorAndForm
   * @type {number} randomIndex // Générer un nombre aléatoire entre 0 et 1
   * @return {string} // Retourne la propriété text1 ou text2 en fonction de l'index randomIndex aléatoire
   */
   const getRandomText = (wordKey) => {
    const randomIndex = Math.floor(Math.random() * 2);
    return randomIndex === 0 ? wordsColorAndForm[wordKey].text1 : wordsColorAndForm[wordKey].text2;
  }

  /**
   * Function createAndEmitRandomTextBackgroundColor() : permet 
   * l'exécution de la fonction getRandomText() afin d'obtenir aléatoirement randomText, le mot aléatoire text1 ou text2 obtenu
   * l'exécution de la fonction getRandomColor() afin d'obtenir aléatoirement randomBackgroundColor, la couleur de fond aléatoire obtenue
   * @type {string} randomText : émettre le mot au client 
   * @type {string} randomBackgroundColor : émettre la couleur de fond au client
   * @return {string} randomBackgroundColor // retourner la couleur de fond afin de pouvoir générer une couleur du texte du mot aléatoire
  */
  const createAndEmitRandomTextBackgroundColor = (randomWordKey, randomColorKey) => {
    const randomText = getRandomText(randomWordKey);
    const randomBackgroundColor = getRandomColor(randomColorKey);
    ioServer.emit('createRandomTextBackgroundColor', { randomText, randomBackgroundColor });
    return randomBackgroundColor
  }

  /**
   * Execution de la function createAndEmitRandomTextBackgroundColor() 
   * @type {string} randomTextAndEmit // Assignement de la valeur text1 ou text2 selectionné
   */

  // let randomBackgroundColor;

   /*** GESTION DES COULEURS ALEATOIRES DES MOTS  ***/
  const colorText = ['rgb(17, 60, 252)', 'rgb(241, 255, 110)', 'rgb(231, 72, 99)', 'rgb(52, 180, 0)'];

  /**
   * getRandomColorIndex()
   * permet de générer un indice aléatoire différent de celui de randomBackgroundColor
   * @return {number} index indice du des couleurs autre que celui de randomBackgroundColor
   */
  const getRandomColorIndex = (randomBackgroundColor) => {
      let index;
      do {
          index = Math.floor(Math.random() * colorText.length);
      } while (colorText[index] === randomBackgroundColor);
      return index;
  }
  


  /**
   * Function createAndEmitRandomColorText() permet :
   * l'exécution de la fonction getRandomColorIndex afin d'obtenir un indice aléatoire pour une couleur différente de randomBackgroundColor
   * @type {number} randomIndex : nombre représentant un dex du tableau colorText
   * @type {string} randomColorText : utilisation de l'indice randomIndex pour obtenir une couleur aléatoire différente de randomBackgroundColor
   * @return {string} randomColorText : émettre la couleur de fond au client
  */
//  let randomColorText;
  const createAndEmitRandomColorText = (randomBackgroundColor) => {
    const randomIndex = getRandomColorIndex(randomBackgroundColor);
    const randomColorText = colorText[randomIndex];
    ioServer.emit('createRandomColorText', randomColorText);
    return randomColorText;
  }





  /*** GESTION DES CLICS SUR LES BOUTONS ***/
  /**
   * Boucle sur les mots clés représants les propriétés de l'objet wordsColorAndForm
   * @type {string[]} keys [ 'blueStar', 'yellowSquare', 'redTriangle', 'greenCircle' ]
   */
  /*** GESTION DU START GAME ***/
  socket.on('startTheGame', () => {
    let randomWordKey = createRandomKeys(keys);
    let randomColorKey = createRandomColorKeys(colorsKeys);
    let randomBackgroundColor = createAndEmitRandomTextBackgroundColor(randomWordKey, randomColorKey);
    let randomColorText = createAndEmitRandomColorText(randomBackgroundColor);

    ioServer.emit('startGameForAllPlayer', { display:'none', randomWordKey, randomColorKey, randomBackgroundColor, randomColorText });
    return randomWordKey;

  });

  for ( const key of keys ) {
      /**
       * yellowSquare : un utilisateur a cliqué sur le bouton avec comme id yellowSquare
       * reçoit du client @type {Object} nicknameIdNameKey
       * @property {string} nickname pseudo du client qui se trouvait dans le localStorage à la connexion, qui fût récupéré et supprimé de suite
       * @property {string} id id se trouvant dans le localStorage du client
       * @property {string} name ex yellowSquare, nom de l'id du bouton qui correspond à une clé, propriété de l'objet wordsColorAndForm
       */
      socket.on( key , (nicknameIdNameKey) => {
        let randomWordKey = nicknameIdNameKey.randomWordKey;
        // vérifier 
        // si le nickname présent dans le localStorage à la connexion 
        // est strictement égal dans l'objet allPlayers, au nickname de l'objet du player à l'indice id 
        try {
          /**
           * Condition qui vérifie si 2 nickname sont exactement semblables
           * @type {string} nicknameIdNameKey.nickname : nickname présent dans le localStorage à la connexion,
           * qui fût récupéré et supprimé immédiatement
           * @type {string} allPlayers[nicknameIdNameKey.id].nickname : nickname se trouvant dans un des objets de l'objet allPlayers  
           * récupéré grâce à l'id nicknameIdNameKey.id correspond à l'id enregistré actuellement dans le localStorage du client 
           */
          if (nicknameIdNameKey.nickname === allPlayers[nicknameIdNameKey.id].nickname) {
            //console.log('nickname et id correct');
            /**
             * Condition qui vérifie si deux mots sont semblables
             * @type {string} nicknameIdNameKey.name : ici yellowSquare, correspond au nom de l'id du bouton cliqué sur le navigateur
             * @type {string} randomWordKey correspond à une clé, propriété de l'un des objets de l'objet wordsColorAndForm
             * 
             * si la condtion est true : 
             * @type {number} 1/ playerScoreCurrentGame : ajouter le nombre 10 au score de la la partie actuelle, scoreCurrentGame
             * propriété de l'objet allPlayers[nicknameIdNameKey.id] qui représente le joueur
             * 
             * @type {object} 2/ émettre au client updatePlayerScoreCurrentGame afin de pouvoir afficher la modification de son score
             * @property {string} playerScoreCurrentGame score de la partie actuelle
             * @property {string} nickname son pseudo
             * 
             * @type {function} 3/ createRandomKeys() executer la fonction afin de générer une nouvelle clé, représentant un des objets de l'objet wordsColorAndForm, puis assigné cette nouvelle valeur à randomWordKey
             * @param {string[]} keys tableau des noms des propriétés de l'objet wordsColorAndForm
             * @return {string} randomWordKey // représente une clé aléatoirement sélectionnée dans le tabeau keys
             * 
             * @type {function} 4/ createAndEmitRandomTextBackgroundColor() executer la fonction afin de générer un nouveau mot 
             * et assigné cette nouvelle valeur à randomTextAndEmit
             * @param {string} randomWordKey clé de l'objet sélectionné, correspondant
             * @return {string} randomText // text1 ou text2 selectionné 
             * 
             */
                           
              if (nicknameIdNameKey.name === randomWordKey) {
                const playerScoreCurrentGame = allPlayers[nicknameIdNameKey.id].scoreCurrentGame += 10;
                ioServer.emit('updatePlayerScoreCurrentGame', {playerScoreCurrentGame, nickname : nicknameIdNameKey.nickname});
                randomWordKey = createRandomKeys(keys);
                let randomColorKey = createRandomColorKeys(colorsKeys);
                let randomBackgroundColor = createAndEmitRandomTextBackgroundColor(randomWordKey, randomColorKey);
                let randomColorText = createAndEmitRandomColorText(randomBackgroundColor);
                ioServer.emit('updateRandomWordKey', { randomWordKey, randomColorKey, randomBackgroundColor, randomColorText });
              } else {
                // retirer 10 points du score du player
                const playerScoreCurrentGame = allPlayers[nicknameIdNameKey.id].scoreCurrentGame -= 10;
                ioServer.emit('updatePlayerScoreCurrentGame', { playerScoreCurrentGame, nickname : nicknameIdNameKey.nickname });
              }
          } 
        } catch (error) { 
          console.error((new Date()).toLocaleString('fr-FR'), 'Déconnexion du player - Erreur son nickname et l\'id présent de localStorage ne corresponde pas : ', error);
          // Forcer la déconnexion du client
          delete allPlayers[playerForThisConnection.id];
          ioServer.emit('destroyPlayer', playerForThisConnection);     
          ioServer.emit('redirection', '/');
          socket.disconnect(true);
        } 
      });
    }
 

  /**
   * GESTION DU CHRONOMETRE
   * @type {number} timer // Variable pour stocker l'identifiant de l'intervalle
   * @type {number} totalTime : au départ 60000, 1 minutes en millisecondes, décrémenté de 10 millisecondes 
   * @type {boolean} start : Variable qui indique si le jeu est commencé et en cours lorsque sa valeur est à true, arrêté quand sa valeur est false
   * 
  */
 // let end = false; // Variable qui indique que le jeu est arrêté true pour pouvoir enregistrer en db les scores ou non false
  let timer; 
  let totalTime = 60 * 1000;
  
  // Démarrer le chronomètre
  socket.on('timerStart', (start) => {
    clearInterval(timer); // s'assurer de ne pas démarrer plusieurs fois
    timer = setInterval( async () => {
      totalTime -= 10; // Décrémenter de 10 millisecondes
      if ( totalTime === 10000) {
        ioServer.emit('redColor_timer', 'red');
      }
      if (totalTime <= 0) {
        clearInterval(timer);  
        ioServer.emit('stop_timer', { start: 'false', display: 'block'});
        try {
          await MongoClient.connect();
          const db = MongoClient.db(String(process.env.DBNAME));
          const collection = db.collection("users");
          for (const id in allPlayers) {
            const objectPlayer = allPlayers[id];
            await collection.updateOne(
              { nickname: objectPlayer.nickname },
              { $set: { scoreCurrentGame: objectPlayer.scoreCurrentGame } }
              );
          } 
        } catch (error) { 
          console.error((new Date()).toLocaleString('fr-FR'), ' Erreur sur la fonction InsertOne : ', error);
        } finally {
          await MongoClient.close();
        }  
        setTimeout(() => { 
          totalTime = 60 * 1000;
          ioServer.emit('restart_timer', { textGameEnd: 'none', textGameStart: 'block' });
        }, 5000);
      
      } else {
        ioServer.emit('show_timer', totalTime);
      }
    }, 10); // Répéter toutes les 10 millisecondes
  });
  
  /*** GESTION DE LA DECONNEXION DU PLAYER ***/
  socket.on('playerConnected', (player) => {
    // console.log(`Player connected with nickname: ${player.nickname}`);
    // console.log(`Player connected with ID: ${player.id}`);
    socket.playerId = player.id;
    socket.playerNickname = player.nickname; 

  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    if (socket.playerId || socket.nickname) {
      // console.log(`Player disconnected with ID: ${socket.playerId} et nickname: ${socket.playerNickname}`);
      /*** A LA DECONNEXION DU PLAYER suppression du player de l'objet allPlayers ***/
      ioServer.emit('destroyPlayer', allPlayers[socket.playerId]);
      delete allPlayers[socket.playerId];
      ioServer.emit('redirection', '/');
    }   
  })
})