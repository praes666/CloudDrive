export default function fileContainer({ file }){
    return(
        <div className="fileContainer">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF4sQx8sfVM24rzmOEXIAVhy0BBeEbEXCl-w&s" alt=""/>
            <p>{file.name}</p>
        </div>
    )
}
