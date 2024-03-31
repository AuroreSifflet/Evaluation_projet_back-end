window.document.addEventListener('DOMContentLoaded', function () {
  // initialisation de la connection
  const socket = io();

  /*** GESTION DES COOKIES ***/
  socket.on('cookie', (cookie) => {
    // Stocker le cookie localement dans le navigateur
    document.cookie = cookie;
  });

  /*** GESTION DES UTILISATEURS ***/

  // Récupérer le nickname du localStorage
  const nickname = localStorage.getItem('nickname');
  // vider le localStorage, plus de nickname
  localStorage.clear();

  socket.on('connect', () => {
    if (nickname !== null) {
      socket.emit('findDataInLocalStorage', nickname);
    }
    // Insérer dans l'id du player dans le localStorage
    socket.on('insertDataInLocalStorage', (playerForThisConnection) => {
      if (playerForThisConnection.nickname === nickname) {
        localStorage.setItem('id', playerForThisConnection.id);
        socket.emit('playerConnected', playerForThisConnection);
      }
    });
      /*** A LA DECONNEXION DU PLAYER suppression du cursorPlayer, du nicknameLi ***/
    socket.on('destroyPlayer', (objectPlayer) => {
      const cursorPlayer = window.document.getElementById(objectPlayer.id);
      const nicknameLi = document.getElementById(objectPlayer.nickname);
      if (cursorPlayer && nicknameLi) {
        cursorPlayer.parentNode.removeChild(cursorPlayer);
        nicknameLi.parentNode.removeChild(nicknameLi);
      }
    });

    socket.on('redirection', (page) => {
      // Redirection de l'utilisateur vers une page
      window.location.href = page;
    });

    });

  /*** RUBRIQUE JOUEURS création pour chaque player de:  nickname : scoreCurrentGame ***/
  const sectionDataPlayers = document.getElementById('sectionDataPlayers');
  socket.on('scoreBoard', (allPlayer) => {
    for (const id in allPlayer) {
      const objectPlayer = allPlayer[id];
      const nicknameLi = document.getElementById(objectPlayer.nickname);
      if (!nicknameLi) {
        sectionDataPlayers.innerHTML += `<li id="${objectPlayer.nickname}">${objectPlayer.nickname} : <span id="${objectPlayer.nickname}ScoreCurrentGame">${objectPlayer.scoreCurrentGame}</span></li>`;
      }
    }
  });

  /*** GESTION DU CURSOR marquer le nickname près du cursor ***/
  socket.on('createOrUpdatePlayerCursor', (objectPlayer) => {
    let cursorPlayer = window.document.getElementById(objectPlayer.id);
    if (!cursorPlayer) {
      cursorPlayer = window.document.createElement('div');
      window.document.body.appendChild(cursorPlayer);
    }
    cursorPlayer.id = objectPlayer.id;
    cursorPlayer.style.left = objectPlayer.x + 10 + 'px'; // Position horizontale
    cursorPlayer.style.top = objectPlayer.y + 10 + 'px'; // Position verticale
    cursorPlayer.style.pointerEvents = 'none';
    // cursorPlayer.style.paddingLeft = '10px';
    cursorPlayer.textContent = objectPlayer.nickname;
    cursorPlayer.style.position = 'absolute';
    cursorPlayer.style.fontWeight = 700;
  });

  document.addEventListener('mousemove', function (event) {
    socket.emit('mouseCoordinatesAndNickname', {
      x: event.clientX,
      y: event.clientY,
      nickname,
    });
  });


  /*** GESTION DU CHRONOMETRE - DU START GAME GESTION DE LA FIN DE LA PARTIE ET START AGAIN ***/
  let start = false; // Variable qui indique si le jeu est commencé et en cours lorsque sa valeur est à true, arrêté quand sa valeur est false
  let end = false; // Variable qui indique que le jeu est arrêté true pour pouvoir enregistrer en db les scores ou non false
  const chronometre = document.getElementById('chronometre');
  // bouton startGame
  const startGame = document.getElementById('startGame');
   // div du bouton startGame
  const textGameStart = document.getElementById('textGameStart');
  // div du bouton endGame
  const textGameEnd = document.getElementById('textGameEnd');
  
  /**
   * @type {function} showTime() : fonction pour afficher le temps écoulé dans le chronomètre
   * @param {number} milliseconds
   */
  const showTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (60 * 1000));
    const secondes = Math.floor((milliseconds % (60 * 1000)) / 1000);
    const millisecondes = Math.floor(milliseconds % 1000);
    const millisecondesSlice = millisecondes.toString().padStart(3, '0').slice(0, 2); // Récupérer les deux premiers chiffres des millisecondes
    chronometre.textContent = `${minutes.toString().padStart(2, '0')}:${secondes.toString().padStart(2, '0')}:${millisecondesSlice}`;
  }

  // Recevoir le temps du chronomètre du serveur toutes les 10 ms
  socket.on('show_timer', (time) => {
    // Mettre à jour l'affichage du chronomètre
    showTime(time);
  });

  // fin du chronomètre
  socket.on('stop_timer', (startDisplay) => {
    start = startDisplay.start;
    textGameEnd.style.display = startDisplay.display;
    
  });

  // timer couleur rouge lorsqu'il reste 10 s
  socket.on('redColor_timer', (redColor) => {
    chronometre.style.color = redColor;
  });

  // timer restart au bout de 5 s
  socket.on('restart_timer', (display) => {    
    textGameEnd.style.display = display.textGameEnd;
    textGameStart.style.display = display.textGameStart;
    start = false;
  });

 


 let spanRandomText = window.document.getElementById('spanRandomText');
 /*** GESTION DES MOTS ET FONDS DE COULEUR ALEATOIRES ***/
 socket.on('createRandomTextBackgroundColor', (randomTextColor) => {
   let pRandomColor = window.document.getElementById('pRandomColor');
   spanRandomText.innerHTML = randomTextColor.randomText;
   pRandomColor.style.backgroundColor = randomTextColor.randomBackgroundColor;
 });

 /*** GESTION DE LA COULEUR DU TEXTE DES MOTS ALEATOIRES ***/
 socket.on('createRandomColorText', (randomColorText) => {
   spanRandomText.style.color = randomColorText;
 });


  /*** GESTION DU LANCEMENT DU JEU ***/
  startGame.addEventListener('click', () => {
    console.log('click startTheGame');
    socket.emit('startTheGame');
  });

  const blueStar = document.getElementById('blueStar');
  const yellowSquare = document.getElementById('yellowSquare');
  const redTriangle = document.getElementById('redTriangle');
  const greenCircle = document.getElementById('greenCircle');
  let randomWordKey;
  let randomColorKey;
  let randomBackgroundColor;
  let randomColorText;

  socket.on('startGameForAllPlayer', (startGameForAllPlayer) => {
    socket.emit('timerStart', start);

    textGameStart.style.display = startGameForAllPlayer.display;

     // Démarrer le chronomètre côté client 
    chronometre.style.color = '#0d6efd';

    start = true;

    randomWordKey = startGameForAllPlayer.randomWordKey;
    randomColorKey = startGameForAllPlayer.randomColorKey;
    randomBackgroundColor = startGameForAllPlayer.randomBackgroundColor;
    randomColorText = startGameForAllPlayer.randomColorText;

    
  
    /*** GESTION DES CLICS SUR LES BOUTONS ***/
    console.log('mon nickname avant le clic', nickname);
    // Récupération du bouton blueStar
    socket.on('updateRandomWordKey', (updateRandomWordKey) => {

      randomWordKey = updateRandomWordKey.randomWordKey;
      randomColorKey = updateRandomWordKey.randomColorKey;
      randomBackgroundColor = updateRandomWordKey.randomBackgroundColor;
      randomColorText = updateRandomWordKey.randomColorText;
    }); 
    blueStar.addEventListener('click', () => {
      // enregistrer l'id du player
        const id = localStorage.getItem('id');
        if(start) {
          socket.emit('blueStar', { nickname, id, name: 'blueStar', randomWordKey});
        }
    });
  
    // Récupération du bouton yellowSquare
    
    yellowSquare.addEventListener('click', () => {
      // enregistrer l'id du player
      const id = localStorage.getItem('id');

      if(start) {
        socket.emit('yellowSquare', { nickname, id, name: 'yellowSquare', randomWordKey});
      }
    });
  
    // Récupération du bouton redTriangle
    
    redTriangle.addEventListener('click', () => {
      // enregistrer l'id du player
      const id = localStorage.getItem('id');
      if (start) {
        socket.emit('redTriangle', { nickname, id, name: 'redTriangle', randomWordKey});    
      }
    });
  
    // Récupération du bouton redTriangle
   
    greenCircle.addEventListener('click', () => {
      // enregistrer l'id du player
      const id = localStorage.getItem('id');
      if (start) {
        socket.emit('greenCircle', { nickname, id, name: 'greenCircle', randomWordKey});   
      }
    });
 
  });

  /*** GESTION MODIFICATIONS DU SCORE ***/
  socket.on('updatePlayerScoreCurrentGame', (player) => {
    const spanPlayerScore = document.getElementById(
      `${player.nickname}ScoreCurrentGame`
    );
    spanPlayerScore.innerText = player.playerScoreCurrentGame;
  });

 
  /*** GESTION ENREGISTREMENT DU ScoreCurrentGame en db ***/
    // const spanPlayerScore = document.getElementById(
    //   `${player.nickname}ScoreCurrentGame`
    // );
    // spanPlayerScore.innerText = player.playerScoreCurrentGame;

  socket.on('error', () => {
    console.log('Erreur de communication websocket.');
  });
});
