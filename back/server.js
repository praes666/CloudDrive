const express = require('express');
const cors = require('cors');
const multer = require('multer')
const path = require('path')
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
            const token = jwt.sign({id: user.rows[0].users_id, login: user.rows[0].login}, JWS_SECRET, {expiresIn: '1h'})
            return res.status(201).json({message: 'Успешная авторизация', token: token})
        }
    }catch(err){
        console.error('auth error:', err);
        return res.status(500).send('Ошибка сервера');
    }
});



const tokenVerify = (req, res, next) => {
    if(jwt.verify(req.headers.authorization, JWS_SECRET)){
        req.user = jwt.decode(req.headers.authorization, JWS_SECRET)
        next()
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cd) => {
        const userFolder = path.join(__dirname, 'uploads', req.user.login)
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true })
        }
        cb(null, userFolder)
    },
    filename: (req, file, cd) => {
        cd(null, `${Date.now()}-${file.originalname}`)
    }
})
const upload = multer({storage})

app.post('/upload', tokenVerify, upload.array('files'), (req, res) => {
    try{
        // await db.query('INSERT INTO files (user_id, file_path, file_name) VALUES ($1, $2, $3)', [req.user.id, ])
        return res.status(201).send('File uploaded!')
    }catch(err){
        console.error('upload error:', err);
        return res.status(500).send('Ошибка сервера');
    }
})

app.get('/getUploads', (req, res) => {
    const {token} = req.body
    try{
        return res.status(201).json({uploadedFiles: fs.readdirSync(path.join(__dirname, "uploads", jwt.decode(token, JWT_SECRET).login)))})
        return res.status(201).sendFile(path.join(__dirname, 'uploads', fs.readdirSync(path.join(__dirname, "uploads")))) // ???
    }catch(err){
        console.error('getUploads error:', err);
        return res.status(500).send('Ошибка сервера');
    }
})

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
  });
