import 'dotenv/config';

import { MongoClient } from 'mongodb';

const url = String(process.env.MONGOURL);
const client = new MongoClient(url);

export default client;