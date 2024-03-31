export const checkPassword = (password) => {
  const minimumLength = 8;
  const specialCharactersAndOneCapitalLetter = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/;

  // Vérifier la longueur minimale
  if (password.length < minimumLength) {
    return false; // Le mot de passe est trop court
  }

  // Vérifier l'utilisation de caractères spéciaux et d'une majuscule
  if (!specialCharactersAndOneCapitalLetter.test(password)) {
    return false; // Le mot de passe ne contient pas de caractères spéciaux ou ne contient pas une majuscule
  }
  
  // Le mot de passe satisfait toutes les conditions
  return true;
};
