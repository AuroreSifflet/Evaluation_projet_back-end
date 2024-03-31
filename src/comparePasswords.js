import bcrypt from 'bcrypt';

export const comparePasswords = async (passwordDataInput, passwordUserDBFind) => {
  let success = false;

  try {
    const pwdMatches = await bcrypt.compare(passwordDataInput, passwordUserDBFind);

    if (!pwdMatches) {
      success = false;
    } else {
      success = true;
    }
  } catch (error) {
    console.error(
      new Date().toLocaleString('fr-FR'),
      " Erreur bcrypt.compare : ",
      error
    );
  }
  return success;
}