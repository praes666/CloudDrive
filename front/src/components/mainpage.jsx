import { useState } from 'react';
import axios from 'axios';
import { FaCirclePlus } from "react-icons/fa6";
import { IoIosCloudDownload } from "react-icons/io";
import '../styles/styles.scss'
import FileContainer from './fileContainer.jsx';


export default function App() {
    const [authData, setAuthdata] = useState({login: '', password: ''})
    const [fileList, setFileList] = useState([])
	const [authvis, setAuthvis] = useState(false)
	const [addFile, setAddFile] = useState(false)

    const authChange = (e) => {
        setAuthdata({...authData, [e.target.name]: e.target.value})
    }

  	const fileListChange = async (e) => {
      	setFileList(e.target.files)   
	}

    const uploadFile = async () => {
		try{
			const formData = new FormData()
			Array.from(fileList).forEach(file => {
				formData.append('files', file)
			})
			const token = localStorage.getItem('token')
			console.log(fileList)
			console.log('formData: ', formData)
			const response = await axios.post('http://localhost:3000/upload', formData, {headers: {
				Authorization: token,
				'Content-Type': 'multipart/form-data'
			}})
			if(response.status == 201){
				window.location.reload()
			}
		}catch(err){
			console.error('upload files error', err)
		}
    }

    const authRequest = async (type) => {
        try{
            const response = await axios.post('http://localhost:3000/auth', {authData, type})
            if(response.status == 201){
                if(response.data.token != undefined) localStorage.setItem('token', response.data.token)
               	window.location.reload()
                alert(response.data.message)
            }
        } catch(error){
            console.error(error)
        }
    }

    return (
      <div>
        <div className="header">
          <img className="logo" src="https://www.freeiconspng.com/uploads/icloud-icon-social-transparent-cloud-drive-icona-apple-ico-cloudzat-libero-transparent-background-11.png" alt=""/>
          {localStorage.getItem("token") != null ? (
            <div className='right_div'>
                <p>{JSON.parse(atob(localStorage.getItem('token').split('.')[1]))?.login}</p>
                <div className='logout' onClick={() => {localStorage.removeItem('token'); window.location.reload()}}>
                    <p>Выход</p>
                    <img src="https://cdn-icons-png.flaticon.com/512/152/152532.png" alt="" />
                </div>
            </div>
          ) : (
              <div className="regbtn">
              <div onClick={() => {setAuthvis(!authvis)}}>
                <p>Вход</p>
                <img src="https://cdn-icons-png.flaticon.com/512/152/152532.png" alt="" />
              </div>
            </div>
          )}
          {
            authvis ?
            (
                <div className='authwindow'>
                    <input name='login' type="text" placeholder='Логин' onChange={authChange}/>
                    <input name='password' type="text" placeholder='Пароль' onChange={authChange}/>
                    <div onClick={() => authRequest('auth')}>
                        <p>Войти</p>
                    </div>
                    <p onClick={() => authRequest('reg')}>Регистрация</p>
                </div>
            )
            :
            null
          }
        </div>  
        <FaCirclePlus className='plusIcon' onClick={() => setAddFile(true)}/>
		{
			addFile ? 
			<div className='addFileInv' onClick={() => setAddFile(false)}>
				<div className='addFileField' onClick={(e) => e.stopPropagation()}>
					<input type="file" name='files' multiple onChange={fileListChange}/>
          			<button onClick={uploadFile}>upload</button>
					<IoIosCloudDownload className='icon'/>
					<p>Перетащите сюда файл!</p>
				</div>
			</div>
			:
			null
		}
        <div className="mainpage">
        	<FileContainer/>
        </div>
      </div>
    );
  }