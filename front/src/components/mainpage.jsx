import { useState } from 'react';
import '../styles/styles.scss'
import FileContainer from './fileContainer.jsx';

export default function App() {
    const [fileList, setFileList] = useState([])
    return (
      <div>
        <div className="header">
          <img className="logo" src="https://www.freeiconspng.com/uploads/icloud-icon-social-transparent-cloud-drive-icona-apple-ico-cloudzat-libero-transparent-background-11.png" alt=""/>
          {localStorage.getItem("token") != null ? (
            <img className="avatar" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1OekKC4YW_f_YZUuz4TIuyMWF_homG7XZCA&s" alt=""/>
          ) : (
            <div className="regbtn">
              <div>
                <img src="https://eduprosvet.ru/image/avatar.png" alt="" />
                <p>Профиль</p>
              </div>
            </div>
          )}
        </div>
  
        <div className="mainpage">
          <FileContainer/>
        </div>
      </div>
    );
  }