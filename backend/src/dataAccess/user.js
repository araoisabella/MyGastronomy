//comunicacao node-mongodb

import {Mongo} from '../database/mongo.js'
import { ObjectId } from 'mongodb' //requisicao do ObjectId para manipular ids do mongo
import {crypto} from 'crypto' //caso o usuario precise mudar a senha, precisa encriptar novamente

const collectionName = 'users' 

export default class UsersDataAccess {
    async getUsers(){
        const result = await Mongo.db
        .collection(collectionName)
        .find({}) //pega todos os dados dentro da tabela users
        .toArray()

        return result 
    }

    async deleteUser() {

    }

    async updateUser() {

    }
}