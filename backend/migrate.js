import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const oldUri = process.env.MONGO_URI.replace('pdfstudy_ai', 'ai_learning_assistant');
const newUri = process.env.MONGO_URI;

async function migrateData() {
    try {
        // Connect to old DB
        const oldConn = mongoose.createConnection(oldUri);
        await oldConn.asPromise();
        console.log('Connected to old DB');

        // Connect to new DB
        const newConn = mongoose.createConnection(newUri);
        await newConn.asPromise();
        console.log('Connected to new DB');

        // Collections to migrate
        const collections = ['users', 'chathistories', 'documents', 'flashcards', 'quizzes'];

        for (const colName of collections) {
            const oldCol = oldConn.db.collection(colName);
            const newCol = newConn.db.collection(colName);

            const documents = await oldCol.find({}).toArray();
            if (documents.length > 0) {
                await newCol.insertMany(documents);
                console.log(`Migrated ${documents.length} documents from ${colName}`);
            } else {
                console.log(`No documents in ${colName}`);
            }
        }

        console.log('Migration completed');
        await oldConn.close();
        await newConn.close();
    } catch (error) {
        console.error('Migration error:', error);
    }
}

migrateData();