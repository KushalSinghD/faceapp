import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';



function App() {
  const videoHeight = 480;
  const videoWidth = 640;
  const [initalising, setInitalising] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {

    const loadModel = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';
      setInitalising(true);
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      ]).then(startVideo);


    }

    loadModel();

  }, [])



  const startVideo = () => {
    var constraints = { video: true, audio: true };

    navigator.mediaDevices.getUserMedia(constraints).then(stream => videoRef.current.srcObject = stream)
  .catch(e => console.error(e));
    // navigator.mediaDevices.getUserMedia({audio: false},{video:
// true}, (stream) => videoRef.current.srcObj = stream);
  }


  const handleVideoPlay = () => {
    setInterval(async () => {
      if (initalising) {
        setInitalising(false)
      }

      canvasRef.current.innerHTML=faceapi.createCanvasFromMedia(videoRef.current);
      const displaySize={
        width:videoWidth,
        height:videoHeight
      }
      faceapi.matchDimensions(canvasRef.current,displaySize);
      const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions).withFaceLandmarks().withFaceExpressions().withAgeAndGender()
        const resizeDetections=faceapi.resizeResults(detections,displaySize);
        canvasRef.current.getContext('2d').clearRect(0,0,videoWidth,videoHeight);
         faceapi.draw.drawDetections(canvasRef.current,detections);
         faceapi.draw.drawFaceLandmarks(canvasRef.current,detections);
        // faceapi.draw.drawFaceExpressions(canvasRef.current,detections);
        // faceapi.draw.drawFaceLandmarks(canvasRef.current,detections);
      console.log(detections);

      

      // for (const face of resizeDetections) {
      //     const features = {
      //     jaw: face.landmarks.positions.slice(0, 17),
      //     eyebrowLeft: face.landmarks.positions.slice(17, 22),
      //     eyebrowRight: face.landmarks.positions.slice(22, 27),
      //     noseBridge: face.landmarks.positions.slice(27, 31),
      //     nose: face.landmarks.positions.slice(31, 36),
      //     eyeLeft: face.landmarks.positions.slice(36, 42),
      //     eyeRight: face.landmarks.positions.slice(42, 48),
      //     lipOuter: face.landmarks.positions.slice(48, 60),
      //     lipInner: face.landmarks.positions.slice(60)
      //   };  

      // }
}, 3000);
  }

  return (
    <div className='container-fluid d-flex justify-content-center'>
      


      <div className='display-flex justify-content-center'>
      <h1>{initalising ? 'initalising ' : 'Ready'}</h1>
        <video ref={videoRef} autoPlay muted height={videoHeight} width={videoWidth} onPlay={handleVideoPlay} />
        <canvas ref={canvasRef}/>
      </div>
    </div>
  );
}

export default App;
