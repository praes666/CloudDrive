import { FaFile } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";
import { BsFiletypeTxt , BsFiletypePng, BsFiletypeJpg, BsFiletypePdf, BsFiletypeDocx, BsFileEarmarkZip} from "react-icons/bs";
import axios from "axios";
import { useRef } from "react";

export default function fileContainer({ file }){
const aRef = useRef()

    const zxc = () => {
        switch (file.split('.')[file.split('.').length-1]){
            case 'txt': return(<BsFiletypeTxt className='fileIcon'/>)
            case 'png': return(<BsFiletypePng className='fileIcon'/>)
            case 'jpg' || 'jpeg': return(<BsFiletypeJpg className='fileIcon'/>)
            case 'pdf': return(<BsFiletypePdf className='fileIcon'/>)
            case 'doc' || 'docx': return(<BsFiletypeDocx  className='fileIcon'/>)
            case 'zip': return(<BsFileEarmarkZip className='fileIcon'/>)

            default: return(<FaFile className='fileIcon'/>)
        }
    }

    const downloadFile = async () => {
        try{
            const response = await axios.get(`http://localhost:3000/download/${JSON.parse(atob(localStorage.getItem('token').split('.')[1]))?.login}/${file}`)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            aRef.href = url
            console.log(url)
            console.log(aRef.current.href)
            aRef.click()
            window.URL.revokeObjectURL(url);
        } catch(error){
            console.error(error)
        }
    }

    const deleteFile = async () => {
        try{
            const response = await axios.get(`http://localhost:3000/delete/${JSON.parse(atob(localStorage.getItem('token').split('.')[1]))?.login}/${file}`)
            console.log(response.status)
            
            if(response.data.message == 'ok') window.location.reload()
        } catch(error){
            console.error(error)
        }
    }

    return(
        <div className="fileContainer">
            <div className="top_buttons">
                <a href="" ref={aRef} download={file.split('-')[1]}>
                <FiDownload style={{color: '#333333'}} onClick={downloadFile}/>
                </a>
                <MdOutlineDelete style={{color: '#333333'}} onClick={deleteFile}/>
            </div>
            {zxc()}
            <p>{file.split('-')[1]}</p>
        </div>
    )
}
