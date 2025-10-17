import express from 'express'
import passport from 'passport'
import localStrategy from 'passport-local'
import crypto from 'crypto'
import { Mongo } from '../database/mongo.js'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb' // mongo coloca um id unico para cada usuario

const collectionName = 'users'

// controle do usuario e criptografia da senha
passport.use(
  new localStrategy.Strategy({ usernameField: 'email' }, async (email, password, callback) => {
    try {
      const user = await Mongo.db
        .collection(collectionName)
        .findOne({ email: email })

      if (!user) {
        return callback(null, false)
      }

      const saltBuffer = user.salt.buffer ? user.salt.buffer : user.salt // salva junto com os dados do usuario, senha criptografada, mas com a chave pra descriptografar
      const userPasswordBuffer = user.password.buffer ? Buffer.from(user.password.buffer) : Buffer.from(user.password) // transforma a senha do banco em buffer

      // numerios default do nodejs para criptografia de senha
      crypto.pbkdf2(password, saltBuffer, 310000, 16, 'sha256', (err, hashedPassword) => {
        if (err) {
          return callback(null, false)
        }

        // compara a senha do usuário com a senha do banco de forma segura
        if (!crypto.timingSafeEqual(userPasswordBuffer, hashedPassword)) {
          return callback(null, false)
        }

        const { password: _, salt, ...rest } = user // objeto user com dados do usuario, mas sem senha e salt

        return callback(null, rest)
      })
    } catch (error) {
      return callback(error)
    }
  })
)

const authRouter = express.Router()

// rota de cadastro
authRouter.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body
    const checkUser = await Mongo.db.collection(collectionName).findOne({ email: email })

    if (checkUser) {
      return res.status(400).send({
        success: false,
        statusCode: 400,
        body: { text: 'User already exists' }
      })
    }

    const salt = crypto.randomBytes(16) // gera a chave para criptografia

    // criptografa a senha usando PBKDF2
    crypto.pbkdf2(password, salt, 310000, 16, 'sha256', async (err, hashedPassword) => {
      if (err) {
        return res.status(500).send({
          success: false,
          statusCode: 500,
          body: { text: 'Error encrypting password', err }
        })
      }

      const result = await Mongo.db.collection(collectionName).insertOne({
        email: email,
        password: hashedPassword,
        salt // chave de criptografia
      })

      if (result.insertedId) {
        const user = await Mongo.db.collection(collectionName).findOne({ _id: new ObjectId(result.insertedId) })
        const { password: _, salt, ...userWithoutSensitive } = user // remove senha e salt
        const token = jwt.sign(userWithoutSensitive, 'secret') // cria token JWT sem senha e salt

        return res.status(200).send({
          success: true,
          statusCode: 200,
          body: {
            text: 'User registered successfully',
            token,
            user: userWithoutSensitive,
            loggedIn: true
          }
        })
      }
    })
  } catch (error) {
    return res.status(500).send({
      success: false,
      statusCode: 500,
      body: { text: 'Server error', error }
    })
  }
})

// rota de login
authRouter.post('/login', (req, res) => {
  passport.authenticate('local', (error, user) => {
    if (error) {
      return res.status(500).send({
        success: false,
        statusCode: 500,
        body: { text: 'Error during authentication.', error }
      })
    }

    if (!user) {
      return res.status(400).send({
        success: false,
        statusCode: 400,
        body: { text: 'User not found.' }
      })
    }

    const token = jwt.sign(user, 'secret') // usuário já sem senha e salt
    return res.status(200).send({
      success: true,
      statusCode: 200,
      body: {
        text: 'User logged in correctly.',
        user,
        token
      }
    })
  })(req, res)
})

export default authRouter
