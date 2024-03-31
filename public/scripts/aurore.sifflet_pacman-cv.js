'use strict'
window.addEventListener('DOMContentLoaded', function () {
  /**
    * NAV Hamburger
    */
   const hamburgerToggler = document.querySelector('.hamburger');
   const navLinksContainer = document.querySelector('.navlinks-container');
   const bodyNavOpen = document.querySelector('.body');
   const toggleNav = () => {
     hamburgerToggler.classList.toggle('open');
     const ariaToggle =
       hamburgerToggler.getAttribute('aria-expanded') === 'true'
         ? 'false'
         : 'true';
     hamburgerToggler.setAttribute('aria-expanded', ariaToggle);
     navLinksContainer.classList.toggle('open');
     bodyNavOpen.classList.toggle('navOpen');
     
   };
   hamburgerToggler.addEventListener('click', toggleNav);

  
   /**
    * Canvas - Contexte
    */
   const canvas = document.querySelector('canvas');
   const ctx = canvas.getContext('2d');
   const divImgGame = document.getElementById('divImgGame');
   const divImgGameOver = document.getElementById('divImgGameOver');
   const scoreNum = document.getElementById('score');
   const skills = document.getElementById('skills');
   
   if (canvas.getContext) {
     canvas.width = 1126;
     canvas.height = 772;
     let score = 0;
     let skill = '';
     
     
    /**
     * Audio
     */
     const audioStartGame = new Audio('../../audio/game_start.mp3');
     const audioPacmanPellet = new Audio('../../audio/game_pacman.mp3');
     const audioGhost = new Audio('../../audio/game_ghost2.mp3');
     const audioDiamant = new Audio('../../audio/game_diamant.mp3');
     const audioGameOver = new Audio('../../audio/game_over.mp3');
     
     const playSound = function() {
       audioPacmanPellet.play();
      //  if (audioPacmanPellet.currentTime !== 0) {
      //   audioPacmanPellet.play();
      // }else{
      //   audioPacmanPellet.play();
      // }
     }
    /**
      * Pellet
      */
    class Pellet {
      constructor({position}) {
        this.position = position,
        this.radius = 3
      }
      draw() {
        //creation du rond grâce la méthode du contexte CanvasRenderingContext2D.arc() 
        //(method) CanvasPath.arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean | undefined): void
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#2c3770';
        ctx.fill();
        ctx.closePath();
      }
    };
    const pellets = [];
    /**
     * Murs du labyrinthe
     */
    //dessiner un wall couleur ou image
    const drawWall = function() {
      if (this.color) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);          
      } else {
        ctx.drawImage(this.image, this.position.x, this.position.y);
      }
    }
    // création d'une classe Wall, qui définit un cube 40*40, correspondant à un pavé du mur du labyrinthe
    class Wall {
      static width = 22
      static height = 22
      constructor({position, color, image}) {
        this.position = position
        this.width = 22,
        this.height = 22,
        this.color = color,
        this.image = image
      }
      draw = drawWall
    }
    // créer des images
    const createImage = function (src) {
      const image = new Image();
      image.src = src;
      return image
    }
    // fabriquer un wall image
    const createWallImage = function (j, i, imgSrc) {
      return (
        walls.push(
          new Wall({
            position : {
              x: j * Wall.width, // * j index column
              y: i * Wall.height // * i index row
            },
            image: createImage(imgSrc)
          })
        )
      )
    }
    // fabriquer un wall color
    const createWallColor = function (j, i, color) {
      return (
        walls.push(
          new Wall({
            position : {
              x: Wall.width * j, // * j index column
              y: Wall.height * i // * i index row
            },
            color: color
          })
        )
      )
    }
    // création d'un parcours labyrinthe en rows et columns, un cube 40*40 correspond à '-'
    const labyrinth = [
      ['L', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', 'T', '-', '-', '-', '-', '-', '-', 'T', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', 'R'],
      ['|', ' ', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
      ['|', '.', '4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', 't', '-', '2', '.', '.', '4', '-', 't', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2', '.', '|'],
      ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
      ['k', '-', '-', '-', '-', '-', 'R', '.', '.', '.', '.', '.', '*', '.', '.', '.', '*', '.', '*', '.', '.', '*', '*', '.', '.', '.', '.', '*', '.', '.', '.', '*', '*', '.', '.', '.', '.', '*', '*', '.', '.', '.', '.', 'L', '-', '-', '-', '-', '-', '-', 'K'],
      ['|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '*', '/', '*', '.', '.', '*', '.', '*', '.', '.', '*', '/', '*', '.', '.', '*', '/', '*', '.', '.', '*', '/', '*', '.', '.', '*', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', '|'],
      ['|', '.', '4', '-', 'T', '-', 't', '-', '-', '2', '.', '*', '/', '*', '.', '.', '*', '.', '*', '.', '.', '*', '*', '.', '.', '.', '*', '/', '*', '.', '.', '*', '*', '.', '.', '.', '*', '*', '*', '.', '4', '-', '-', 't', '-', '-', 'T', '-', '2', '.', '|'],
      ['|', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', '*', '*', '*', '.', '.', '*', '.', '*', '.', '.', '*', '.', '*', '.', '.', '*', '/', '*', '.', '.', '*', '.', '*', '.', '.', '*', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', '|'],
      ['|', '.', '4', '-', 't', '-', '-', '-', '2', '.', '.', '*', '.', '*', '.', '.', '.', '*', '*', '.', '.', '*', '.', '*', '.', '.', '.', '*', '.', '.', '.', '*', '.', '*', '.', '.', '*', '*', '*', '.', '.', '4', '-', '-', '-', '-', 't', '-', '2', '.', '|'],
      ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
      ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
      ['|', '.', '4', '-', 'T', '-', '-', '-', '2', '.', '.', '*', '*', '.', '.', '*', '.', '.', '.', '*', '*', '.', '.', '.', '*', '*', '.', '.', '*', '.', '.', '.', '.', '.', '*', '*', '.', '.', '*', '*', '*', '.', '4', '-', '-', '-', 'T', '-', '2', '.', '|'],
      ['|', '.', '.', '.', '|', '.', '.', '.', '.', '.', '*', '.', '.', '.', '.', '*', '.', '.', '*', '.', '.', '.', '.', '*', '.', '.', '.', '.', '*', '.', '.', '.', '.', '*', '.', '.', '.', '.', '.', '*', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', '|'],
      ['|', '.', '4', '-', 't', '-', 'T', '-', '2', '.', '*', '*', '*', '.', '.', '*', '.', '.', '*', '*', '.', '.', '.', '*', '*', '.', '.', '.', '*', '.', '.', '.', '.', '*', '*', '.', '.', '.', '.', '*', '.', '.', '4', '-', 'T', '-', 't', '-', '2', '.', '|'],
      ['|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '*', '.', '.', '*', '.', '.', '*', '.', '.', '.', '.', '*', '.', '.', '.', '.', '*', '.', '.', '.', '.', '*', '.', '.', '.', '.', '.', '*', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '|'],
      ['k', '-', '-', '-', '-', '-', 'D', '.', '.', '.', '*', '*', '*', '.', '.', '*', '.', '.', '*', '.', '.', '.', '.', '*', '.', '.', '.', '.', '*', '*', '*', '.', '.', '*', '*', '*', '.', '.', '.', '*', '.', '.', '.', '.', 'G', '-', '-', '-', '-', '-', 'K'],
      ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
      ['|', '.', '.', '.', '+', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
      ['|', '.', '.', '.', '+', '.', '.', '+', '.', '.', '.', '.', '.', '.', '.', '.', '.', '+', '.', '.', '.', '.', '.', '+', '.', '.', '+', '.', '.', '.', '.', '.', '+', '+', '.', '+', '.', '.', '+', '+', '.', '.', '.', '+', '.', '.', '+', '.', '+', '.', '|'],
      ['|', '.', '.', '.', '+', '.', '+', '/', '+', '.', '+', '.', '+', '.', '.', '.', '+', '.', '.', '.', '.', '.', '.', '+', '.', '.', '+', '.', '.', '.', '.', '+', '.', '.', '.', '+', '+', '.', '.', '.', '+', '.', '+', '.', '+', '.', '+', '.', '+', '.', '|'],
      ['|', '.', '.', '+', '+', '.', '+', '+', '+', '.', '+', '.', '+', '.', '.', '.', '+', '+', '.', '+', '.', '+', '.', '+', '.', '.', '+', '.', '.', '.', '.', '.', '+', '.', '.', '+', '.', '.', '+', '+', '+', '.', '+', '.', '.', '.', '+', '+', '.', '.', '|'],
      ['|', '.', '+', '/', '+', '.', '+', '.', '.', '.', '+', '.', '+', '.', '.', '.', '+', '.', '.', '+', '.', '+', '.', '+', '.', '.', '+', '.', '.', '.', '.', '.', '.', '+', '.', '+', '.', '.', '+', '/', '+', '.', '+', '.', '+', '.', '+', '.', '+', '.', '|'],
      ['|', '.', '.', '+', '+', '.', '.', '+', '.', '.', '.', '+', '.', '.', '.', '.', '+', '.', '.', '.', '+', '+', '.', '.', '+', '.', '.', '+', '.', '.', '.', '+', '+', '+', '.', '+', '.', '.', '.', '+', '+', '.', '.', '+', '.', '.', '+', '.', '+', '.', '|'],
      ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
      ['|', '.', '4', '-', '-', '-', '-', '-', '-', 'T', '-', '-', '-', '2', '.', '4', '-', 'T', '-', '-', '-', '-', '-', '-', '-', 'T', '-', '-', '2', '.', '4', '-', '-', '-', 'T', '-', '-', '-', '-', '-', 'T', '-', '-', '-', '-', 'T', '-', '-', '2', '.', '|'],
      ['|', '.', '.', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '3', '.', '.', '.', '.', '|'],
      ['|', '.', '.', '.', 'p', 'p', 'p', '.', '.', '3', '.', '.', 'b', 'b', 'b', '.', '.', '3', '.', '.', 'o', 'o', 'o', '.', '.', '3', '.', '.', 'r', 'r', 'r', '.', '.', '.', '3', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
      ['|', '.', '.', 'p', 'p', 'p', 'p', 'p', '.', '.', '.', 'b', 'b', 'b', 'b', 'b', '.', '.', '.', 'o', 'o', 'o', 'o', 'o', '.', '.', '.', 'r', 'r', 'r', 'r', 'r', '.', '.', '.', '.', 'g', '.', 'g', '.', '3', '.', '.', 'r', 'r', '.', 'r', 'r', '.', '.', '|'],
      ['|', '.', 'p', '0', 'f', 'p', '0', 'f', 'p', '.', 'b', 'f', '0', 'b', 'f', '0', 'b', '.', 'o', 'f', 'f', 'o', 'f', 'f', 'o', '.', 'r', 'f', 'f', 'r', 'f', 'f', 'r', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'r', 'r', 'r', 'r', 'r', 'r', 'r', '.', '|'],
      ['|', '.', 'p', 'f', 'f', 'p', 'f', 'f', 'p', '.', 'b', 'f', 'f', 'b', 'f', 'f', 'b', '.', 'o', 'f', '0', 'o', 'f', '0', 'o', '.', 'r', '0', 'f', 'r', '0', 'f', 'r', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'r', 'r', 'r', 'r', 'r', 'r', 'r', '.', '|'],
      ['|', '.', 'p', 'p', 'p', 'p', 'p', 'p', 'p', '.', 'b', 'b', 'b', 'b', 'b', 'b', 'b', '.', 'o', 'o', 'o', 'o', 'o', 'b', 'o', '.', 'r', 'r', 'r', 'r', 'r', 'r', 'r', '.', '.', 'r', '.', '.', '.', 'r', '.', '.', '.', 'r', 'r', 'r', 'r', 'r', '.', '.', '|'],
      ['|', '.', 'p', 'p', 'p', 'p', 'p', 'p', 'p', '.', 'b', 'b', 'b', 'b', 'b', 'b', 'b', '.', 'o', 'o', 'o', 'o', 'o', 'o', 'o', '.', 'r', 'r', 'r', 'r', 'r', 'r', 'r', '.', '.', '.', 'r', 'r', 'r', '.', '.', '1', '.', '.', 'r', 'r', 'r', '.', '.', '.', '|'],
      ['|', '.', 'p', '.', 'p', 'p', '.', 'p', 'p', '.', 'b', '.', 'b', 'b', '.', 'b', 'b', '.', 'o', '.', 'o', 'o', '.', 'o', 'o', '.', 'r', '.', 'r', 'r', '.', 'r', 'r', '.', '.', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', 'r', '.', '.', '.', '.', '|'],
      ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
      ['G', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', 't', '-', '-', '-', '-', '-', '-', '-', '-', 'D'],
    ] 
    // création d'un tableau walls, regroupant tous les objets wall, pavés du labyrinthe avec leurs positionnements {x, y}, couleur, image, width, heigth, draw()
    // walls est un tableau d'objets wall [ {x: 0, y: 0}, { x: 40, y: 0}, { x: 80, y: 0},{ x: 40, y: 160 }, … ]
    const walls = [];

    labyrinth.forEach((row, i) => {
      row.forEach((symbol, j) => {
        switch (symbol) {
          // brick
          case '-':
            createWallImage(j, i, '../../image/wall_horizontal.png');
            break
          case '|':
            createWallImage(j, i, '../../image/wall_vertical.png');
            break
          case 'L':
            createWallImage(j, i, '../../image/wall_corner_top_left.png');
            break
          case 'R':
            createWallImage(j, i, '../../image/wall_corner_top_right.png');
            break
          case 'D':
            createWallImage(j, i, '../../image/wall_corner_bottom_right.png');
            break
          case 'G':
            createWallImage(j, i, '../../image/wall_corner_bottom_left.png');
            break
          //brick round
          case '1':
            createWallImage(j, i, '../../image/wall_round_top.png');
            break
          case '2':
            createWallImage(j, i, '../../image/wall_round_right.png');
            break
          case '3':
            createWallImage(j, i, '../../image/wall_round_bottom.png');
            break
          case '4':
            createWallImage(j, i, '../../image/wall_round_left.png');
            break
          //brick T
          case 'T':
            createWallImage(j, i, '../../image/wall_t_top.png');
            break
            case 'K':
              createWallImage(j, i, '../../image/wall_t_right.png');
              break
          case 't':
            createWallImage(j, i, '../../image/wall_t_bottom.png');
            break
          case 'k':
            createWallImage(j, i, '../../image/wall_t_left.png');
            break
          // typo
          case '*':
            createWallColor(j, i, '#E80675');
            break
          case '+':
            createWallColor(j, i, '#8b008b');
            break
          case '/':
            createWallColor(j, i, '#010101');
            break
            // inactive ghost / smiley / heart
          case 'r':
          createWallColor(j, i, '#ee0000');
            break
          case 'g':
            createWallColor(j, i, '#008662');
            break
          case 'f':
            createWallColor(j, i, '#ffffff');
            break
          case '0':
            createWallColor(j, i, '#1D1B98');
            break
          case 'p':
            createWallColor(j, i, '#ff9899');
            break
          case 'b':
            createWallColor(j, i, '#64fafb');
            break
          case 'o':
            createWallColor(j, i, '#fa9c00');
            break
          case '.':
            pellets.push(
              new Pellet({
                position : {
                  x: j * Wall.width + Wall.width/2, // * j index column
                  y: i * Wall.height + Wall.height/2 // * i index row
                },
              })
            )
            break
        }
      })
    });
    //console.log(walls);
    
    /**
     * Player - Pacman
     */
    // création d'une classe PacmanPlayer
    // velocity pour modification ou non de la position
    class PacmanPlayer {
      constructor({position, velocity}) {
        this.position = position,
        this.velocity = velocity,
        this.radius = 8
      }
      draw() {
        //creation du rond grâce la méthode du contexte CanvasRenderingContext2D.arc() 
        //(method) CanvasPath.arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean | undefined): void
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();
      }
      udpdateMove() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
      }
    };
    // positionner le centre du cercle pacmanPlayer par rapport aux murs du labyrinthe 22+11
    const pacmanPlayer = new PacmanPlayer({
      position: {
        x: Wall.width + Wall.width/2, 
        y: Wall.height + Wall.height/2
      },
      velocity: {
        x: 0,
        y: 0
      }
    })
    /**
     * Ghost active enemies
     */
    class Ghost {
      static speed = 1
      constructor({position, velocity, color = 'red'}) {
        this.position = position,
        this.velocity = velocity,
        this.radius = 8,
        this.color = color,
        this.previousCollisions = [],
        this.speed = 1
      }
      draw() {
        //creation du rond grâce la méthode du contexte CanvasRenderingContext2D.arc() 
        //(method) CanvasPath.arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean | undefined): void
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
      }
      udpdateMove() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
      }
    };
    const ghosts = [
      new Ghost({
        position: {
          x: Wall.width * 28 + Wall.width/2, 
          y: Wall.height * 3   + Wall.height/2
        },
        velocity: {
          x: Ghost.speed,
          y: 0
        },
      }),
    ];


    /**
     * Événement keydown, chaque fois que l'utilisateur appuiera sur la touche du clavier
     * Mouvement de pacmanPlayer
     */
    // création d'un booléen afin d'éviter d'avoir un temps de pause lorsque nous changeons de direction et de pouvoir changer de direction quand nous appuyons sur deux touches en même temps
    const keys = {
      ArrowUp: {
        pressed: false
      },
      z: {
        pressed: false
      },
      ArrowLeft: {
        pressed: false
      },
      q: {
        pressed: false
      },
      ArrowDown: {
        pressed: false
      },
      s: {
        pressed: false
      },
      ArrowRight: {
        pressed: false
      },
      d: {
        pressed: false
      }
    }
    // Lorsque plusieurs touches sont appuyées en même temps, mémorisation de laskey pour savoir quelle touche a été appuyée en dernier.
    let lastKey;
    document.addEventListener('keydown', ({key}) => {
      switch (key) {
        case 'ArrowUp':
        case 'z':
          keys.ArrowUp.pressed = true;
          keys.z.pressed = true;
          lastKey = 'ArrowUpOrZ';
          
          break;
        case 'ArrowRight':
        case 'd':
          keys.ArrowRight.pressed = true;
          keys.d.pressed = true;
          lastKey = 'ArrowRightOrD';
          break;
        case 'ArrowDown':
        case 's':
          keys.ArrowDown.pressed = true;
          keys.s.pressed = true;
          lastKey = 'ArrowDownOrS';
          break;
        case 'ArrowLeft':
        case 'q':
          keys.ArrowLeft.pressed = true;
          keys.q.pressed = true;
          lastKey = 'ArrowLeftOrQ';
          break;
      }
    });

    document.addEventListener('keyup', ({key}) => {
      switch (key) {
        case 'ArrowUp':
        case 'z':
          if (keys.ArrowUp.pressed || keys.z.pressed) {
            keys.ArrowUp.pressed = false;
            keys.z.pressed = false;
            // réinitialiser lastkey au keyup, afin de revenir au déplacement de la première touche appuyée. 
            // Si le player a appuyé sur une première touche, puis en même tps une deuxième, lorsque qu'il keyup la deuxième touche, il faut pouvoir toujours faire le déplacement de la première touche appuyée.
            lastKey ='';
            pacmanPlayer.velocity.y = 0;            
          }
          break;
        case 'ArrowRight':
        case 'd':
          if (keys.ArrowRight.pressed || keys.d.pressed) {
            keys.ArrowRight.pressed = false;
            keys.d.pressed = false;
            lastKey ='';
            pacmanPlayer.velocity.x = 0;
          }
          break;
        case 'ArrowDown':
        case 's':
          if (keys.ArrowDown.pressed || keys.s.pressed) {
            keys.ArrowDown.pressed = false;
            keys.s.pressed = false;
            lastKey ='';
            pacmanPlayer.velocity.y = 0;
          }
          break;
        case 'ArrowLeft':
        case 'q':
          if (keys.ArrowLeft.pressed || keys.q.pressed) {
            keys.ArrowLeft.pressed = false;
            keys.q.pressed = false;
            lastKey ='';
            pacmanPlayer.velocity.x = 0;
          }
          break;
      }
    });
       
    /**
     * Sprite Diamants
    */
    const spriteDiamants = new Image();
    spriteDiamants.src = '../../image/sprite_diamants.png';
    // taille d'un cadre d'une image du sprite (780/15 728/14)
    const spriteDiamantsWidth = 52;
    const spriteDiamantsHeight = 52;
 
    // pouvoir bouger sur l'axe des x et y et afficher les images suivantes
    // let frameXFix = 0;
    // const frameYFix = 5;
    // ralentir l'animation du sprite
    let gameFrame = 0;
    // échelonner l'animation de 3 et changer d'image tous les 4 animations loop
    const staggerFrame = 4;

    // tableau d'objet qui contientra toutes les données de mes images diamants, avec les positions pour chaque frame - Object { name: "yellowTurned", position: (15) […] }
    const spriteAnimation = [];
    // tableau définssant tous les types de diamants - sur l'axe des y (14 obj)
    const diamantsType = [
      {
        name: 'yellowTurned',
      },
      {
        name: 'yellowIdle',
      },
      {
        name: 'whiteTurned',
      },
      {
        name: 'whiteIdle',
      },
      {
        name: 'blueTurned',
      },
      {
        name: 'blueIdle',
      },
      {
        name: 'redTurned',
      },
      {
        name: 'redIdle',
      },
      {
        name: 'pinkTurned',
      },
      {
        name: 'pinkIdle',
      },
      {
        name: 'orangeTurned',
      },
      {
        name: 'orangeIdle',
      },
      {
        name: 'greenTurned',
      },
      {
        name: 'greenIdle',
      }
    ];
    // i row, est l'index des obj du tableau diamantsType - j column, 15 car 15 diamants sur axe des x
    diamantsType.forEach((obj, i) => {
      const position = []; 
      for (let j = 0; j < 15; j++) {
        position.push({
          x: j * spriteDiamantsWidth, 
          y: i * spriteDiamantsHeight
        });
      };
      // création d'un objet pour chaque type de diamants dans le tableau spriteAnimation
      spriteAnimation[i] = {
        name : obj.name,
        position : position
      };
      //console.log(spriteAnimation)
      // Array(14) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, … ]
      // 0: Object { name: "yellowTurned", position: (15) […] }
      //console.log(spriteAnimation[i], i);
    });

    let frameY_BlueTurned, frameY_RedTurned, frameY_YellowTurned, frameY_OrangeTurned, frameY_WhiteTurned, frameY_GreenTurned, frameY_PinkTurned, frameY_RedIdle, frameY_PinkIdle, frameY_OrangeIdle;
    // 12 objets diamants positionnés sur le canvas
    const diamantsCanvasObj = [
      {
        frameY_name: frameY_BlueTurned,
        posXCanvas: 170,
        posYCanvas: 73,
        visible: true,
        skill: 'JavaScript'
      },
      {
        frameY_name: frameY_BlueTurned,
        posXCanvas: 876,
        posYCanvas: 73,
        visible: true,
        skill: 'TypeScript'
      },
      {
        frameY_name: frameY_YellowTurned,
        posXCanvas: 160,
        posYCanvas: 310,
        visible: true,
        skill: 'Angular'
      },
      {
        frameY_name: frameY_RedTurned,
        posXCanvas: 314,
        posYCanvas: 184,
        visible: true,
        skill: 'React'
      },
      {
        frameY_name: frameY_OrangeTurned,
        posXCanvas: 446,
        posYCanvas: 285,
        visible: true,
        skill: 'React Native'
      },
      {
        frameY_name: frameY_PinkTurned,
        posXCanvas: 655,
        posYCanvas: 250,
        visible: true,
        skill: 'Node.js'
      },
      {
        frameY_name: frameY_RedTurned,
        posXCanvas: 897,
        posYCanvas: 308,
        visible: true,
        skill: 'MongoDB'

      },
      {
        frameY_name: frameY_WhiteTurned,
        posXCanvas: 292,
        posYCanvas: 446,
        visible: true,
        skill: 'SQL'
      },
      {
        frameY_name: frameY_WhiteTurned,
        posXCanvas: 622,
        posYCanvas: 446,
        visible: true,
        skill: 'HTML'
      },
      {
        frameY_name: frameY_GreenTurned,
        posXCanvas: 770,
        posYCanvas: 580,
        visible: true,
        skill: 'PHP'
      },
      {
        frameY_name: frameY_GreenTurned,
        posXCanvas: 828,
        posYCanvas: 580,
        visible: true,
        skill: 'WebSocket'
      },
      {
        frameY_name: frameY_RedIdle,
        posXCanvas: 1042,
        posYCanvas: 690,
        visible: true,
        skill: 'ExpressJS'
      },
    ]
    /**
     * Conditions collisions pacmaPlayer with Diamant : top - right - bottom - left
     */ 
       const collisionPacamWithTheDiamant = function ({thePacman, theDiamant}) {
        return (
          thePacman.position.y - thePacman.radius + thePacman.velocity.y <= theDiamant.posYCanvas + spriteDiamantsHeight &&  
          thePacman.position.x + thePacman.radius + thePacman.velocity.x >= theDiamant.posXCanvas &&
          thePacman.position.y + thePacman.radius + thePacman.velocity.y >= theDiamant.posYCanvas &&
          thePacman.position.x - thePacman.radius + thePacman.velocity.x <= theDiamant.posXCanvas + spriteDiamantsWidth
        )    
      }
      
    /**
     * Conditions collisions PacmanPlawer with Wall : top - right - bottom - left
     */ 
    const collisionPacamOrGhostWithWall = function ({thePacmanOrTheGhost, theWall}) {
      const padding = Wall.width / 2 - thePacmanOrTheGhost.radius - 2
      return (
        thePacmanOrTheGhost.position.y - thePacmanOrTheGhost.radius + thePacmanOrTheGhost.velocity.y <= theWall.position.y + theWall.height + padding &&  
        thePacmanOrTheGhost.position.x + thePacmanOrTheGhost.radius + thePacmanOrTheGhost.velocity.x >= theWall.position.x - padding &&
        thePacmanOrTheGhost.position.y + thePacmanOrTheGhost.radius + thePacmanOrTheGhost.velocity.y >= theWall.position.y - padding &&
        thePacmanOrTheGhost.position.x - thePacmanOrTheGhost.radius + thePacmanOrTheGhost.velocity.x <= theWall.position.x + theWall.width + padding
      )    
    }

    /**
     * Boucle d'animation avec la méthode window.requestAnimationFrame() - POUR : murs labyrinthe - pacman déplacements, 
     * mise à jour de l'animation environ 60 fois par seconde
     */ 
    // sans requestAnimationFrame() la fonction updateMove est appelé qu'une seule fois, lors du chargement de la page 
    const animateLoop = function() {
      //effacer tout ce qu'il y'a sur le canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let animateLoopId = requestAnimationFrame(animateLoop); 
      
      // appliquer une modification de déplacement du pacman en fonction de la touche appuyée en dernier: keys pressed, 
      // si nous appuyons sur deux ou trois touches en même temps: lastKey
      if (
        (keys.ArrowUp.pressed || keys.z.pressed) && 
        (lastKey === 'ArrowUpOrZ' || lastKey === '')
      ) {
        for ( let i = 0; i < walls.length; i++) {
          const wall = walls[i];
          //console.log(pacmanPlayer); //position: Object { Object { x: 115, y: 140 }, radius: 15, velocity: Object { x: 0, y: 0 } }
          // anticiper les collisions des murs placés en haut du pacman
          // test pour savoir si pacmanPlayer entre en collision ou non avec le haut d'un mur
          if (  
            collisionPacamOrGhostWithWall({
              thePacmanOrTheGhost: {
                ...pacmanPlayer,
                velocity: {
                  x: 0,
                  y: -3
                } 
              },
              theWall: wall
            })
            ) {
              pacmanPlayer.velocity.y = 0;
              break
            } else {
              pacmanPlayer.velocity.y = -3;
            }
        }           
      } else if (
        (keys.ArrowRight.pressed || keys.d.pressed) && 
        (lastKey === 'ArrowRightOrD' || lastKey === '')
      ) {
          for ( let i = 0; i < walls.length; i++) {
            const wall = walls[i];
            // test pour savoir si pacmanPlayer entre en collision ou non avec le côté gauche d'un mur
            if (  
              collisionPacamOrGhostWithWall({
                thePacmanOrTheGhost: {
                  ...pacmanPlayer,
                  velocity: {
                    x: 3,
                    y: 0
                  } 
                },
                theWall: wall
              })
              ) {
                pacmanPlayer.velocity.x = 0;
                break
              } else {
                pacmanPlayer.velocity.x = 3;
              }
          }      
        } else if (
          (keys.ArrowDown.pressed || keys.s.pressed) && 
          (lastKey === 'ArrowDownOrS' || lastKey === '')
        ) {
            for ( let i = 0; i < walls.length; i++) {
              const wall = walls[i];
              if (  
                collisionPacamOrGhostWithWall({
                  thePacmanOrTheGhost: {
                    ...pacmanPlayer,
                    velocity: {
                      x: 0,
                      y: 3
                    } 
                  },
                  theWall: wall
                })
                ) {
                  pacmanPlayer.velocity.y = 0;
                  break
                } else {
                  pacmanPlayer.velocity.y = 3;
                }
            }      
          } else if (
            (keys.ArrowLeft.pressed || keys.q.pressed) && 
            (lastKey === 'ArrowLeftOrQ' || lastKey === '')
          ) {
              for ( let i = 0; i < walls.length; i++) {
                const wall = walls[i];
                if (  
                  collisionPacamOrGhostWithWall({
                    thePacmanOrTheGhost: {
                      ...pacmanPlayer,
                      velocity: {
                        x: -3,
                        y: 0
                      } 
                    },
                    theWall: wall
                  })
                  ) {
                    pacmanPlayer.velocity.x = 0;
                    break
                  } else {
                    pacmanPlayer.velocity.x = -3;
                  }
              }      
            };
          
      // dessiner les murs du labyrinthe : boucler sur le tableau walls afin de dessiner chaque objet wall avec draw()
      walls.forEach((wall) => {
        wall.draw();           
        // si collision : remettre les velocity à 0
        if(
          collisionPacamOrGhostWithWall({
            thePacmanOrTheGhost: pacmanPlayer,
            theWall: wall
          })
          ) 
          {
            //console.log('collision');
            pacmanPlayer.velocity.x = 0;
            pacmanPlayer.velocity.y = 0;
          }
      });

      // dessiner les pellets et les supprimer
      // console.dir(pellets); //Array(1011) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, … ]
      // 0: Object { position: Object { x: 55, y: 33 }, radius: 3 } 
      pellets.forEach((pellet, i) => {
        pellet.draw();
        // condition de détection de collisison entre deux cercles : pacmanPlayer avec pellet
        if(
          Math.hypot(
            pellet.position.x - pacmanPlayer.position.x, pellet.position.y - pacmanPlayer.position.y
          ) < pellet.radius + pacmanPlayer.radius
        ) {
          //console.log(pellets[i], i);
          // suppression du pellet à l'index i
          const pelletDelete = Reflect.deleteProperty(pellets, i);
          //audio quand pacman mange un pellet
          if (pelletDelete) {           
             console.log('audio ok', audioPacmanPellet.currentTime, audioPacmanPellet.autoplay) ;
              playSound();      
          }
      
          //console.dir(pellets);
          //Array(1011) [ <4 empty slots>, {…}, {…}, {…}, {…}, {…}, {…}, … ]
          // [0…99] // 4: Object { position: {…}, radius: 3 }

          /*
           * Ajouter 10 points au score lorsque pacmanPlayer entre en collision avec un pellet
           */
          score += 10;
          scoreNum.innerHTML = score;
        }
      });

      /*
       * Animer le Sprite diamants
       */
      /* dessine un type de diamants avec des valeurs fixes de frameXFix et FrameYFix */
      // ctx.drawImage(spriteDiamants, spriteDiamantsWidth * frameXFix, spriteDiamantsHeight * frameYFix, spriteDiamantsWidth, spriteDiamantsHeight, 170, 73, spriteDiamantsWidth, spriteDiamantsHeight);
      // if ( gameFrame % staggerFrame === 0) {
      //   if ( frameXFix < 14 ) {
      //     frameXFix++;
      //   } else {
      //     frameXFix = 0;
      //   }
      // }

      /* dessiner des diamants avec des valeurs dynamiques de frameX et frameY */
      // (gameFrame définit à 0 puis incrémenté) / (staggerFrame définit à 4, l'image du diamant est modifiée toutes les 4 animations loop)
      // 0/4 = 0   
      // 1/4 = 0.25   2/4 = 0.5     3/4 = 0.75   4/4 = 1
      // 5/4 = 1.25  6/4 = 1.5    7/4 = 1.75    8/4 = 2
      // 9/4 = 2.25  10/4 = 2.5   11/4 = 2.75   12/4 = 3

      // Math.floor( gameFrame / staggerFrame ) :
      // Math.floor(0) = 0   Math.floor(0.25) = 0   Math.floor(0.5)= 0   Math.floor(0.75)= 0   Math.floor(1) = 1

      // 14 car 15 images (index du premier 0, puis les 14 autres)
      // donc 0%14 0%14 0%14 0%14 1%14= 1
      // 1 % 14 = 1 car 1/14 est 0 et le reste de 0 à 1 est 1
      // 2 % 14 = 2 jusqu'à 13 % 14 = 13
      // 14 % 14 = 0
      // positionSprite est nombre entier de 1 à 13, nombre qui permet d'obtenir des valeurs de frameX et frameY dynamique
      const positionSprite = Math.floor( gameFrame / staggerFrame ) % 14;

      // frameX correspond aux différentes positions de x d'un diamant - axe des x dynamique
      const frameX = spriteDiamantsWidth * positionSprite;

      // axe y de tous les types de diamants
      
      frameY_YellowTurned = spriteAnimation[0].position[positionSprite].y;
      //const frameY_YellowIdle = spriteAnimation[1].position[positionSprite].y;
      frameY_WhiteTurned = spriteAnimation[2].position[positionSprite].y;
      //const frameY_WhiteIdle = spriteAnimation[3].position[positionSprite].y;
      frameY_BlueTurned = spriteAnimation[4].position[positionSprite].y;
      //const frameY_BlueIdle = spriteAnimation[5].position[positionSprite].y;
      frameY_RedTurned = spriteAnimation[6].position[positionSprite].y;
      frameY_RedIdle = spriteAnimation[7].position[positionSprite].y;
      frameY_PinkTurned = spriteAnimation[8].position[positionSprite].y;
      frameY_PinkIdle = spriteAnimation[9].position[positionSprite].y;
      frameY_OrangeTurned = spriteAnimation[10].position[positionSprite].y;
      frameY_OrangeIdle = spriteAnimation[11].position[positionSprite].y;
      frameY_GreenTurned = spriteAnimation[12].position[positionSprite].y;
      //const frameY_GreenIdle = spriteAnimation[13].position[positionSprite].y;
      gameFrame++;
      diamantsCanvasObj[0].frameY_name = frameY_BlueTurned;
      diamantsCanvasObj[1].frameY_name = frameY_BlueTurned;
      diamantsCanvasObj[2].frameY_name = frameY_RedTurned;
      diamantsCanvasObj[3].frameY_name = frameY_YellowTurned;
      diamantsCanvasObj[4].frameY_name = frameY_OrangeTurned;
      diamantsCanvasObj[5].frameY_name = frameY_PinkTurned;
      diamantsCanvasObj[6].frameY_name = frameY_RedTurned;
      diamantsCanvasObj[7].frameY_name = frameY_WhiteTurned;
      diamantsCanvasObj[8].frameY_name = frameY_WhiteTurned;
      diamantsCanvasObj[9].frameY_name = frameY_GreenTurned;
      diamantsCanvasObj[10].frameY_name = frameY_GreenTurned;
      diamantsCanvasObj[11].frameY_name = frameY_RedIdle;

      const drawImageDiamants = function(frameY_name, posXCanvas, posYCanvas) {
       return ctx.drawImage(spriteDiamants, frameX, frameY_name, spriteDiamantsWidth, spriteDiamantsHeight, posXCanvas, posYCanvas, spriteDiamantsWidth, spriteDiamantsHeight);
      }

      //console.dir(diamantsCanvasObj);//Array(12) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, … ]
      diamantsCanvasObj.forEach((element) => {
        // dessiner le diammant si il a la propriété de visible à true
        if (element.visible) {
          drawImageDiamants(element.frameY_name, element.posXCanvas, element.posYCanvas);   
        }
        // condition de collision du pacmanPlayer avec un diamant
        if(
          collisionPacamWithTheDiamant({
            thePacman: {
              ...pacmanPlayer,
            },
            theDiamant: element
          })
          ) {
            /*
            * Lorsque le pacmanPlayer rentre en collision pour la première fois avec le diamant concerné
            * Ajouter 50 points au score, mettre la propriété de l'objet visible à false, ajouter la compétence au innerHTML
            */

            if (element.visible) {
              audioDiamant.play();
              score += 50;
              scoreNum.innerHTML = score;
              element.visible = false; 
              skill =  element.skill;
              skills.innerHTML += `<span>${skill} </span><br />`;
            }
        }
      });
       
      // modifier la position de mon pacman afin de dessiner ses déplacements
      pacmanPlayer.udpdateMove();

      // tableau permettant de détecter les collisions
      const collisions = [];
      // créer ghosts
      ghosts.forEach(ghost => {
        ghost.udpdateMove();
        // setTimeout(() => {
        //   audioGhost.play()
        // }, 5000);
        if(
          Math.hypot(
            ghost.position.x - pacmanPlayer.position.x, ghost.position.y - pacmanPlayer.position.y
          ) < ghost.radius + pacmanPlayer.radius
        ) {
          cancelAnimationFrame(animateLoopId);
          setTimeout(() => {
            audioGameOver.play();
            divImgGameOver.style = 'display: block;'
            canvas.style = 'display: none;'
          }, 1000);
        }
        walls.forEach(wall => {
          // top
          if (  
            // nous insérons dans le tableau collisions le mot up seulement 
            // si le mot up n'est pas inclus dans le tableau collisions
            !collisions.includes('up') &&
            //et si le fantôme est entré en collision précédemment avec le mur du haut 
            collisionPacamOrGhostWithWall({
              thePacmanOrTheGhost: {
                ...ghost,
                velocity: {
                  x: 0,
                  y: -Ghost.speed
                } 
              },
              theWall: wall
            })
          ) {
              // si le ghost va entrer en collision avec un mur en haut alors insérer dans le tableau de collisions 'up'
              collisions.push('up');
                ghost.velocity.x = 0;
                ghost.velocity.y = 1;
          }
          if (
            !collisions.includes('right') &&
            collisionPacamOrGhostWithWall({
              thePacmanOrTheGhost: {
                ...ghost,
                velocity: {
                  x: Ghost.speed,
                  y: 0
                } 
              },
              theWall: wall
            })
          ) {
            collisions.push('right');
              ghost.velocity.x = -1;
              ghost.velocity.y = 0;
          }
          // bottom
          if (
            !collisions.includes('down') &&
            collisionPacamOrGhostWithWall({
              thePacmanOrTheGhost: {
                ...ghost,
                velocity: {
                  x: 0,
                  y: Ghost.speed
                } 
              },
              theWall: wall
            })
          ) {
           collisions.push('down');
              ghost.velocity.x = 0;
              ghost.velocity.y = -1;
          }
          //left
          if ( 
            !collisions.includes('left') && 
            collisionPacamOrGhostWithWall({
              thePacmanOrTheGhost: {
                ...ghost,
                velocity: {
                  x: -Ghost.speed,
                  y: 0
                } 
              },
              theWall: wall
            })
          ) {
            collisions.push('left');
              ghost.velocity.x = 1;
              ghost.velocity.y = 0;
          }
        })
        
        //console.log(ghost.previousCollisions);
        if (collisions.length > ghost.previousCollisions.length) {
         // console.log(collisions);
          ghost.previousCollisions = collisions;
        }
        // console.log('collissions stringify : ',JSON.stringify(collisions));
        // console.log('previousCollisions stringify : ', JSON.stringify(ghost.previousCollisions))
        //console.log(collisions);
        
        // regarder quand le contenu des deux tableaux stingify ne sont pas identiques
        if (JSON.stringify(collisions) !== JSON.stringify(ghost.previousCollisions)) {
          if (ghost.velocity.x > 0) {
            ghost.previousCollisions.push('right');
          } else if (ghost.velocity.x < 0) {
            ghost.previousCollisions.push('left');
          } else if (ghost.velocity.y < 0) {
            ghost.previousCollisions.push('up');
          } else if (ghost.velocity.y > 0) {
            ghost.previousCollisions.push('down');
          }
          const pathGhost = ghost.previousCollisions.filter((collision) => {
            return !collisions.includes(collision)
        });
        
          const directionGhost = pathGhost[Math.floor(Math.random() * pathGhost.length)];
          // console.log(ghost.previousCollisions);
          // console.log(pathGhost);
          switch (directionGhost) {
            case 'up':
              ghost.velocity.x = 0;
              ghost.velocity.y = -ghost.speed;
              break;
            case 'right':
              ghost.velocity.x = ghost.speed;
              ghost.velocity.y = 0;
              break;
            case 'down':
              ghost.velocity.x = 0;
              ghost.velocity.y = ghost.speed;
              break;
            case 'left':
              ghost.velocity.x = -ghost.speed;
              ghost.velocity.y = 0;
              break;
          }
          ghost.previousCollisions = [];
        }      
      });
      //console.dir(collisions);
      
    }

    divImgGame.addEventListener('click', function(){
      divImgGame.style = 'display: none;'
      audioStartGame.play();
      animateLoop();
    });
    // divImgGameOver.addEventListener('click', function(){
    //   divImgGameOver.style = 'display: none;'
    //   canvas.style = 'display: block';
    //   audioStartGame.play();
    //   animateLoop();
    // });

  } else {
    // code pour le cas où canvas ne serait pas supporté
    //mettre une image
  }
});