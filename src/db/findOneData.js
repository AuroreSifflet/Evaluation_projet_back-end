import client from './client-mongo.js';

export const findOneData = async (db, coll, query, projectionObject) => {
  try {
    await client.connect();
    const collection = client.db(db).collection(coll);
    const response = await collection.findOne(query, { projection: projectionObject});
    const data = response; 
    return data;  
  } catch (error) {
    console.error(error);
  // } finally {
  //   await client.close();
   }  
};
