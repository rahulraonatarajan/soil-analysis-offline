import { parseSoilReport } from './soilParser.js';

const fileInput = document.getElementById('fileInput');
const outputDiv = document.getElementById('output');
const loadingStatus = document.getElementById('loadingStatus');
const dots = document.getElementById('dots');
const progressBar = document.getElementById('progressBar');
const appContainer = document.getElementById('appContainer');
const chatInput = document.getElementById('chatInput');
const chatLog = document.getElementById('chatLog');
const chatSend = document.getElementById('chatSend');

// Animate loading dots
let dotInterval = setInterval(() => {
  dots.innerText = dots.innerText.length >= 3 ? '' : dots.innerText + '.';
}, 500);

// Load model
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.11.0';

let chat;
let modelLoaded = false;

async function loadModel() {
  let interval = setInterval(() => {
    let width = parseInt(progressBar.style.width) || 0;
    if (width < 90) {
      progressBar.style.width = (width + 5) + "%";
    }
  }, 300);

  chat = await pipeline('text-generation', 'Xenova/TinyLlama-1.1B-Chat-v0.3', {
    quantized: true
  });

  clearInterval(interval);
  progressBar.style.width = "100%";
  clearInterval(dotInterval);
  loadingStatus.innerText = "Model loaded and ready!";

  // Reveal app
  setTimeout(() => {
    document.getElementById('loadingContainer').style.display = 'none';
    appContainer.style.display = 'block';
  }, 1000);

  modelLoaded = true;
}

async function askModel(prompt) {
  if (!modelLoaded) return "Model not loaded yet.";
  const result = await chat(prompt, { max_new_tokens: 128 });
  return result[0].generated_text;
}

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const text = await parseSoilReport(file);
    const output = await askModel(text);
    outputDiv.innerText = output;
  }
});

chatSend.addEventListener('click', async () => {
  const userInput = chatInput.value.trim();
  if (!userInput) return;
  chatLog.innerHTML += `<div><strong>You:</strong> ${userInput}</div>`;
  const response = await askModel(userInput);
  chatLog.innerHTML += `<div><strong>AI:</strong> ${response}</div>`;
  chatInput.value = "";
});

loadModel();
