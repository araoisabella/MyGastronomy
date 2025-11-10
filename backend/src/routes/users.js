import express from 'express'
import usersControllers from '../controllers/users.js'

const usersRouter = express.Router()

const usersController = new usersControllers()

usersRouter.get('/', async (req, res) => {
    const {success, statusCode, body} = await usersController.getUsers()
    
    res.status(statusCode).send({success, statusCode, body})
})

export default usersRouter