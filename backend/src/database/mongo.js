import {MongoClient} from 'mongodb' //classe utilizada para criar conexao com o banco


export const Mongo = {
    async connect({mongoConnectionString, mongoDbName}){
        try {
            const client = new MongoClient(mongoConnectionString) //url de conexao
            
            await client.connect();
            const db = client.db(mongoDbName)

            this.client = client
            this.db = db

            return 'Connected to Mongo!'

        } catch (error){
            return {text: 'Error during Mongo connection', error}
        }
    }
}