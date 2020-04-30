//setting the consts
const video = document.getElementById('video')
const canvas = document.getElementById('canvas')
const c = canvas.getContext('2d')

//increase this value to reduce load on CPU
//decrease this value for a smoother experience
const interval = 300

//load all the models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

//color for each mood
let moodColors = {
  "neutral" : "white" ,
  "happy" : "#F9F871" ,
  "sad" : "#4FFBDF" ,
  "surprised" : "#FFC75F" , 
  "angry" : "#D73222" , 
  "fearful" : "#B0A8B9" , 
  "disgusted" : "green"
}

//load the video stream into the video element
function startVideo() {
  navigator.getUserMedia(
    { 
      video: 
            {
              //the ideal part is imp, it helps to get 16:9 ratio also
              height : { ideal : window.innerHeight } ,
              width : { ideal : window.innerWidth }
            } 
      } ,
      stream => video.srcObject = stream,
      err => console.error(err)
  ) 
}

//if page is resized
window.addEventListener('resize' , () => {
  //reloading the page, cause clearInterval() for async doesn't work properly
  window.location.reload(true)
})

//face's default values
let face = { x : video.videoWidth/2 , y : video.videoHeight /2 , expression : "neutral" }

//if the video is played 
video.addEventListener('play', () => {
  
  //sett canvas height and width same as video's
  //NOTE : can also be done using faceapi.matchDimensions(canvas, displaySize)
  canvas.height = video.videoHeight
  canvas.width = video.videoWidth

  //it's required to resize the results
  const displaySize = { width: video.videoWidth, height: video.videoHeight }
  
  //call the async funtion every 'interval'
  setInterval( async () => {

    //detect using api
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
    //resize with respect to canvas size i.e 'displaySize'
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    
    //if no face is detected then nothing
    if( resizedDetections.length >= 1 ) {

      //set few util variables
      let pos = resizedDetections[0].detection.box
      let exp = "happy"
      
      //finding Max of the expression probabilities
      for( var expression in resizedDetections[0].expressions ) {
        if( resizedDetections[0].expressions[expression] > resizedDetections[0].expressions[exp])
          exp = expression
      }
      
      //Setting calculated values
      face.expression = exp 
      //Calculating the centre of face
      //inverting x cordinates 
      face.x = video.videoWidth - (pos._x + pos._width/2) 
      face.y = pos._y + pos._height/2 
    
    } 
  }, interval)
})

function animate() {
  requestAnimationFrame(animate);

  //Clearing the canvas 
  c.clearRect(0, 0, canvas.width, canvas.height)
  
  //Drawing 
  c.beginPath()
  c.arc( face.x, face.y, 30 , 0, Math.PI*2, false )
  c.fillStyle = moodColors[face.expression]
  c.fill()
}

//start the animation (tracking)
animate()





