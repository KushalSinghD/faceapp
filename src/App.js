import React, { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";


function App() {
  const videoHeight = 480;
  const videoWidth = 640;
  const [initalising, setInitalising] = useState(false);
  const [faceData, setFaceData] = useState([]);
  const [listExp, setListExp] = useState([]);
  const [img, setImage] = useState();
  const [timer,setTimer]=useState(0);
  const [experssions, setExpressions] = useState({
    neutral: 0,
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0,
  });
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const loadModel = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + "/models";
      setInitalising(true);
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      ]).then(startVideo);
    };

    loadModel();
  }, [faceData]);

  const startVideo = () => {
    var constraints = { video: true, audio: true };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        videoRef.current.srcObject = stream;
        const track = stream.getVideoTracks()[0];

        let imageCapture = new ImageCapture(track);

        setTimeout(() => {
          imageCapture
            .takePhoto()
            .then(function (blob) {
              console.log("Took photo:", blob);
              setImage(URL.createObjectURL(blob));
            })
            .catch(function (error) {
              console.log("takePhoto() error: ", error);
            });
        }, 10000);
      })
      .catch((e) => console.error(e));
  };

  // const startVideo = () => {
  //   var constraints = { video: true, audio: true };
  //   navigator.mediaDevices
  //     .getUserMedia(constraints)
  //     .then((stream) =>{
  //       console.log(stream)
  //       const track = stream.getVideoTracks()[0];
  //       let imageCapture = new ImageCapture(track);

  //     })
  //     .catch((e) => console.error(e));
  // };

  const handleVideoPlay = () => {
    setInterval(async () => {
      if (initalising) {
        setInitalising(false);
      }

      canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(
        videoRef.current
      );
      const displaySize = {
        width: videoWidth,
        height: videoHeight,
      };
      faceapi.matchDimensions(canvasRef.current, displaySize);
      const detections = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();
      const resizeDetections = faceapi.resizeResults(detections, displaySize);
      canvasRef.current
        .getContext("2d")
        .clearRect(0, 0, videoWidth, videoHeight);
      faceapi.draw.drawDetections(canvasRef.current, detections);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, detections);
      faceapi.draw.drawFaceExpressions(canvasRef.current, detections);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, detections);
      faceData.length = 0;
      faceData.push(detections);
      faceData.length = 1;
      getFaceData();

      let res = [];
      res.push(resizeDetections);
      //console.log("eyebrowLeft",res[0].landmarks.positions.slice(17,22));
      //  console.log("eyebrowLeft",res[0].landmarks.positions.slice(22,27));
      // for (const face of resizeDetections) {

      //   console.log("this is face",face);
      //   const features = {
      //   jaw: face.landmarks.positions.slice(0, 17),
      //   eyebrowLeft: face.landmarks.positions.slice(17, 22),
      //   eyebrowRight: face.landmarks.positions.slice(22, 27),
      //   noseBridge: face.landmarks.positions.slice(27, 31),
      //   nose: face.landmarks.positions.slice(31, 36),
      //   eyeLeft: face.landmarks.positions.slice(36, 42),
      //   eyeRight: face.landmarks.positions.slice(42, 48),
      //   lipOuter: face.landmarks.positions.slice(48, 60),
      //   lipInner: face.landmarks.positions.slice(60)
      // };

      //  }
    }, 1000);
  };

  const getFaceData = async () => {
    let det = {};
    faceData.map((dt) => (det = dt.expressions));
    const sds = Object.keys(det).reduce((a, b) => (det[a] > det[b] ? a : b));
    console.log(sds);
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
  };

  return (
    <>
    <div className="container-fluid d-flex justify-content-center">
      <div className="display-flex justify-content-center text-center">
        <h1>{initalising ? "Getting Ready " : "Ready"}</h1>
        <video
          ref={videoRef}
          autoPlay
          muted
          height={videoHeight}
          width={videoWidth}
          onPlay={handleVideoPlay}
        />
        <canvas ref={canvasRef} />
       
      </div>
     
    </div>
    <div>
      <div>
      <a className="">
          <img src={img} />
        </a>
      </div>
    </div>
    </>
  );
}

export default App;
