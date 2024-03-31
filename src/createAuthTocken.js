import jwt from 'jsonwebtoken';

export const createAuthToken = (payload) => {
  const privateKey = String(process.env.PRIVATEKEYJWT);
  
  const authToken = jwt.sign(payload, privateKey, { expiresIn: 60 });

  return authToken;
};