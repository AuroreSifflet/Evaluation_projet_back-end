import jwt from 'jsonwebtoken';

export const checkAuthentication = (req, res, next) => {
  const userToken = req?.session?.user?.authToken;
  const privateKey = String(process.env.PRIVATEKEY);
  let isAuthenticated = undefined;

  if (req.url === '/jeu-multijoueur' && !userToken) {
    next();
    return res.redirect(`/`);
  }

  if (req.url === '/jeu-multijoueur' && userToken) {
    return res.redirect(`/jeu-multijoueur`);
  }

  isAuthenticated = jwt.verify(userToken, privateKey);
  if (isAuthenticated) {
    return true
  } else {
    return res.redirect('/connexion');
  }
};
