const video = document.getElementById('video')
let canvas = document.getElementById('canvas')
let timeGapInput = document.getElementById('time-gap')
let c = canvas.getContext('2d')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

let moodColors = {
  "neutral" : "white" ,
  "happy" : "#F9F871" ,
  "sad" : "#4FFBDF" ,
  "surprised" : "#FFC75F" , 
  "angry" : "#D73222" , 
  "fearful" : "#B0A8B9" , 
  "disgusted" : "green"
}

function startVideo() {
  navigator.getUserMedia(
    { 
      video: 
            {
              height : { ideal : window.innerHeight } ,
              width : { ideal : window.innerWidth }
            } 
      } ,
      stream => video.srcObject = stream,
      err => console.error(err)
  ) 
}

window.addEventListener('resize' , () => {
  window.location.reload(true)
})

let face = { x : video.videoWidth/2 , y : video.videoHeight /2 , expression : "neutral" }

video.addEventListener('play', () => {
  canvas.height = video.videoHeight
  canvas.width = video.videoWidth
  const displaySize = { width: video.videoWidth, height: video.videoHeight }
  setInterval( async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    if( resizedDetections.length >= 1 ) {
      let pos = resizedDetections[0].detection.box
      let exp = "happy"
      face.x = video.videoWidth - (pos._x + pos._width/2) 
      face.y = pos._y + pos._height/2 
      for( var expression in resizedDetections[0].expressions ) {
        if( resizedDetections[0].expressions[expression] > resizedDetections[0].expressions[exp])
          exp = expression
      }
      console.log( resizedDetections[0].expressions )
      face.expression = exp
    } 
  }, 100)
})

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height)
  c.beginPath()
  c.arc( face.x, face.y, 30 , 0, Math.PI*2, false )
  c.fillStyle = moodColors[face.expression]
  c.fill()
}
animate()





