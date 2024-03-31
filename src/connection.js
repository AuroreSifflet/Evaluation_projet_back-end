import { findOneData } from './db/findOneData.js';
import { checkPassword } from './checkPassword.js';
import { comparePasswords } from './comparePasswords.js';
import { createAuthToken } from './createAuthTocken.js';

export const connection = async (req, res) => {
  const usernameDataInput = String(req.body.pseudo);
  const passwordDataInput = String(req.body.password);
  let loginResult = {};
  let userInfoSession = {};
  let success = false;
  if (!usernameDataInput || !passwordDataInput) {
    return (loginResult = {
      message: `Vous devez indiquer un pseudonyme et un mot de passe pour pouvoir vous connecter et participer au jeu multijoueur.`,
      timeout: 2000,
      success: false
    });
  } else {
    if (!checkPassword(passwordDataInput)) {
      return (loginResult = {
        message: `Votre mot de passe doit contenir 8 caractères, comprenant au moins une Majuscule et un caractère spécial`,
        timeout: 2000,
        success: false
      });        
    } else {
      try {
        const userDBFind = await findOneData(
          String(process.env.DBNAME),
          'users',
          { nickname: usernameDataInput },
          { nickname: 1, password: 1, _id: 0 }
        );
          
        if (!userDBFind) {
          return (loginResult = {
            message: `Votre pseudonyme “${usernameDataInput}” ou/et votre mot de passe sont incorrects, veuillez renouveller votre saisie pour pouvoir participer au jeu multijoueur`,
            timeout: 2000,
            success: false
          });
        } else {
          try {
            //comparer les mdp dataInput et dataDB
            const passwordUserDBFind = userDBFind.password;
            const matchPasswords = await comparePasswords(
              passwordDataInput,
              passwordUserDBFind
            );
            console.log(matchPasswords);
            if (!matchPasswords) {
              loginResult = {
                success,
                message: `Le pseudonyme ou/et le mot de passe sont incorrects. Veuillez renouveller votre saisie`,
                timeout: 2000,
                success: false
              }
            } else {
              //je creer un authtoken que 
              const payload = {
                id: userDBFind.id,
                nickname: userDBFind.nickname
              }
              const authToken = createAuthToken(payload);
              //j'enregistre dans la session
              userInfoSession = {
                nickname: userDBFind.nickname,
                authToken
              }
              req.session.user = userInfoSession;
              //je redirige vers le jeu multijoueur
              return (loginResult = {
                message: `Bienvenue “${usernameDataInput}”. Vous allez être redirigé vers la page du jeu, bonne partie et bonne chance`,
                timeout: 500,
                success: true,
                url: '/jeu-multijoueur'
              });
            }
            
          } catch (error) { 
            console.error((new Date()).toLocaleString('fr-FR'), ' Erreur sur la connexion : ', error);
            return (loginResult = {
              message: `Je suis navrée votre connexion n'a pu aboutir. Veuillez renouveller votre participation au jeu ultérieurement`,
              timeout: 2000,
              success: false
            });
          }
        }
      } catch (error) { 
        console.error((new Date()).toLocaleString('fr-FR'), ' Erreur sur la fonction findOneData à la connexion : ', error);
        return (loginResult = {
          message: `Je suis navrée, le serveur ne répond pas, veuillez essayer de vous connecter ultérieurement`,
          timeout: 3000,
          success: false
        });
      }
    }
  }

}