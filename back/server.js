const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const db = require('./db')

const app = express()
const port = 3000;
app.use(cors());
app.use(express.json())
const JWS_SECRET = 'CloudDrive'

app.post('/auth', async (req, res) => {
    const {authData, type} = req.body
    try {
        if(type == 'reg'){
            const isLogin = await db.query('SELECT * FROM users WHERE login = $1', [authData.login])
            if(isLogin.rowCount == 0){
                await db.query('INSERT INTO users(login, password) VALUES($1, $2)', [authData.login, bcrypt.hashSync(authData.password, 10)])
                return res.status(201).json({message: 'Пользователь успешно зарегестрирован!'})
            }else{
                return res.status(201).json({message: 'Пользователь с таким логином уже зарегестрирован!'})
            }
        }else{
            const user = await db.query('SELECT * FROM users WHERE login = $1', [authData.login])
            if(user.rowCount == 0) return res.status(201).json({message: 'Пользователя не существует!'})
            if(!bcrypt.compareSync(authData.password, user.rows[0].password)) return res.status(201).json({message: 'Неверный пароль'}) 
            const token = jwt.sign({id: user.rows[0].id, login: user.rows[0].login}, JWS_SECRET, {expiresIn: '1h'})
            return res.status(201).json({message: 'Успешная авторизация', token: token})
        }
    }catch(err){
        console.error('auth error:', err);
        res.status(500).send('Ошибка сервера');
    }
});

app.post('/upload', (req, res) => {
    try{
        console.log(req.body)
        return res.status(200).send(req.files)
    }catch(err){
        console.error('upload error:', err);
        res.status(500).send('Ошибка сервера');
    }
})

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
  });