import client from './client-mongo.js';

export const insertOneData = async (db, coll, dataToInsert) => {
  try {
    await client.connect();
    const collection = client.db(db).collection(coll);
    const response = await collection.insertOne(dataToInsert);
    return response;
  } catch (error) {
    console.error(error);
  } finally {
    client.close();
  }
};