import bcrypt from 'bcrypt';

import { checkPassword } from './checkPassword.js';
import { findOneData } from './db/findOneData.js';
import { insertOneData } from './db/insertOneData.js';

let subscribeResult = {};
const userAvatar = '';
const userScoreCurrentGame = 0;
const userScoreBest = 0;
const userPlayingTime = 0;
const userId = crypto.randomUUID();
const saltRounds = parseInt(process.env.SALTROUNDS);

export const inscription = async (req, res) => {
  const usernameDataInput = String(req.body.pseudo);
  const passwordDataInput = String(req.body.password);

  if (!usernameDataInput || !passwordDataInput) {
    return (subscribeResult = {
      message: `Vous devez indiquer un pseudonyme et un mot de passe pour pouvoir vous inscrire et participer au jeu multijoueur.`,
      timeout: 3000,
      success: false
    });
  } else {
    if (!checkPassword(passwordDataInput)) {
      return (subscribeResult = {
        message: `Votre mot de passe doit contenir 8 caractères, comprenant au moins une Majuscule et un caractère spécial`,
        timeout: 3000,
        success: false
      });
    } else {
      try {
        const findUserResult = await findOneData(
          String(process.env.DBNAME),
          'users',
          { nickname: usernameDataInput },
          { nickname: 1, _id: 0 }
        );
        if (findUserResult) {
          return (subscribeResult = {
            message: `Un compte est déjà associé avec le pseudo “${usernameDataInput}”, merci de vous inscrire sous un autre pseudonyme`,
            timeout: 3000,
            success: false
          });
        } else {
          try {
            const hashedPassword = await bcrypt.hash(passwordDataInput, saltRounds);
            await insertOneData(String(process.env.DBNAME), 'users', {
              id: userId,
              nickname: usernameDataInput,
              password: hashedPassword,
              avatar: userAvatar,
              scoreCurrentGame: userScoreCurrentGame,
              scoreBest: userScoreBest,
              playingTime: userPlayingTime,
            });
            return (subscribeResult = {
              message: `Un nouveau compte a été créé pour le pseudonyme “${usernameDataInput}”. Vous allez être redirigé vers la page de connexion`,
              url: '/connexion',
              timeout: 3000,
              success: true
            });
          } catch (error) {
            console.error(
              new Date().toLocaleString('fr-FR'),
              ' Erreur sur la fonction insertOneData : ',
              error
            );
            return (subscribeResult = {
              message: `Je suis navrée, votre inscription n'a pas aboutie, veuillez indiquer un pseudonyme et un mot de passe pour vous inscrire`,
              timeout: 3000,
              success: false
            });
          }
        }
      } catch (error) {
        console.error(
          new Date().toLocaleString('fr-FR'),
          " Erreur sur la fonction findOneData à l'inscription : ",
          error
        );
        return (subscribeResult = {
          message: `Je suis navrée, le serveur ne répond pas, veuillez essayer de vous inscrire ultérieurement`,
          timeout: 3000,
          success: false
        });
      }
    }
  }
};
