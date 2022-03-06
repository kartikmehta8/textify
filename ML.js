
const URL = "https://teachablemachine.withgoogle.com/models/BZHP6brwE/";

const btnStartRecord = document.getElementById('btnStartRecord');
const btnStopRecord = document.getElementById('btnStopRecord');
const btnPlayText = document.getElementById('playText');  
const text = document.getElementById('text');

let recognition = new webkitSpeechRecognition();
recognition.lang ='en-US';
recognition.continuous = true;
recognition.interimResults = true;

let model, webcam, labelContainer, maxPredictions;

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true; 
  webcam = new tmImage.Webcam(250, 250, flip); 
  await webcam.setup(); 
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
      labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

recognition.onresult = (event) => {
  const results = event.results;
  const sentence = results[results.length - 1][0].transcript;
  text.value += sentence;
}

recognition.onend = (event) => {
  console.log('the microphone stops listening');
}

recognition.onerror = (event) => {
  console.log(event.error)
}


async function predict() {
  const prediction = await model.predict(webcam.canvas);
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;
            
    if (labelContainer.childNodes[i].innerHTML.toString().substring(0, 5) === "start" && prediction[i].probability.toFixed(2) > 0.98) {
      console.log("START");
      recognition.start();
    }

    if (labelContainer.childNodes[i].innerHTML.toString().substring(0, 5) === "clear" && prediction[i].probability.toFixed(2) > 0.98) {
      console.log("CLEAR");
      readText(text.value);
    }

    if (labelContainer.childNodes[i].innerHTML.toString().substring(0, 5) === "stop:" && prediction[i].probability.toFixed(2) > 0.98) {
      console.log("STOP");
      recognition.abort();
    }

  }
}

btnStartRecord.addEventListener('click', () => {
  recognition.start();
});

btnStopRecord.addEventListener('click', () => {
  recognition.abort();
});

btnPlayText.addEventListener('click', () => {
  readText(text.value);
});

function readText(text) {
  const speech = new SpeechSynthesisUtterance();
  speech.text = text;
  speech.volume = 1;
  speech.rate = 1;
  speech.pitch = 1;
  window.speechSynthesis.speak(speech);
}