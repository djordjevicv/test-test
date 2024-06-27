import React from 'react';
import './FaceRecognition.css';
const FaceRecognition = ({ imageSource, boxProperties }) => {
    //console.log("Podaci", boxProperties);
    if (imageSource !== "") {
        return (
            <div className='imageContainer'>
                <img id="inputChange" src={imageSource} alt="" width="500px" height="300px" />
                <div className='boundingBox' style={{
                    top: boxProperties.topRow,
                    left: boxProperties.leftCol,
                    width: (boxProperties.rightCol - boxProperties.leftCol),
                    height: (boxProperties.bottomRow - boxProperties.topRow),
                }}>
                </div>
            </div>
            
        );
    }
    return (<></>);
}

export default FaceRecognition;