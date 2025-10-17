import express from 'express'
import cors from 'cors'
import {Mongo} from './database/mongo.js'
import {config} from 'dotenv'
import authRouter from './auth/auth.js'

//criando um servidor web com express
//express: cria o servidor
//cors: permite requisicoes de outros dominios
//configura o servidor para json e requisicoes externas

config()

async function main () {
    const hostname = 'localhost'
    const port = 3000

    const app = express()

    const mongoConnection = await Mongo.connect({mongoConnectionString: process.env.Mongo_CS, mongoDbName: process.env.MONGO_DB_NAME})
    console.log(mongoConnection)

    app.use(express.json()) //arruma a resposta do servidor 
    app.use(cors())

    app.get('/', (req, res) => { //rota GET '/' responde boas vindas em formato json
        res.send({
            success: true,
            statusCode: 200,
            body: 'Welcome to MyGastronomy!'
        })
    })  //requisicao quando eh acessado o app

    app.use('/auth', authRouter)

    app.listen(port, () => {
        console.log(`Server running on: http://${hostname}:${port}`)
    })
}

main()
