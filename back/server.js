const express = require('express');
const cors = require('cors');
const multer = require('multer')
const path = require('path')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const db = require('./db')
const fs = require('fs');

const app = express()
const port = 3000;
app.use(cors());
app.use(express.json())
const JWT_SECRET = 'CloudDrive'

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
            const token = jwt.sign({id: user.rows[0].users_id, user_id: user.rows[0].user_id,login: user.rows[0].login}, JWT_SECRET, {expiresIn: '1h'})
            return res.status(201).json({message: 'Успешная авторизация', token: token})
        }
    }catch(err){
        console.error('auth error:', err);
        return res.status(500).send('Ошибка сервера');
    }
});



const tokenVerify = (req, res, next) => {
    if(jwt.verify(req.headers.authorization, JWT_SECRET)){
        req.user = jwt.decode(req.headers.authorization, JWT_SECRET)
        next()
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cd) => {
        const userFolder = path.join(__dirname, '../uploads', req.user.login)
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true })
        }
        cd(null, userFolder)
    },
    filename: (req, file, cd) => {
        cd(null, `${Date.now()}-${file.originalname}`)
    }
})
const upload = multer({storage})

app.post('/upload', tokenVerify, upload.array('files'), (req, res) => {
    try{
        return res.status(201).send('File uploaded!')
    }catch(err){
        console.error('upload error:', err);
        return res.status(500).send('Ошибка сервера');
    }
})

app.post('/getUploads', (req, res) => {
    const {token} = req.body
    try{
        const files = fs.readdirSync(path.join(__dirname, "../uploads", jwt.decode(token, JWT_SECRET).login))
        return res.status(201).json({uploadedFiles: files})
    }catch(err){
        console.error('getUploads error:', err);
        return res.status(500).send('Ошибка сервера');
    }
})

app.post('/checkValidToken', async (req, res) => {
    const {token} = req.body
    try{
        if(jwt.verify(token, JWT_SECRET)) return res.status(201).json({isValid: true})
            else return res.status(201).json({isValid: false})
    }catch(error){
        console.log('TokinValidError db error:', error)
        return res.status(201).json({isValid: false})
    }
})

app.get('/download/:login/:file', tokenVerify, async (req, res) => {
    try {
        const userFolder = path.join(__dirname, '../uploads', req.user.login);
        const filePath = path.join(userFolder, req.params.file);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Файл не найден' });
        }

        res.setHeader('Content-Disposition', `attachment; filename="${req.params.file}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (err) {
        console.error('Download file error:', err);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/delete/:login/:file', async (req, res) => {
    try{
        fs.unlinkSync(path.join(__dirname, '../uploads', req.params.login, req.params.file))
        res.status(201).json({message: 'ok'})
    }catch(err){
        console.error('delete file error:', err);
        return res.status(500).send('Ошибка сервера');
    }
})

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
  });
