let questions = [];
let wrongQuestions = [];

let current = 0;
let score = 0;
let round = 1;

let stats = {}; // 🔥 tracking de fallos

// ---------------- CSV ----------------
async function loadCSV() {
  const response = await fetch("preguntas.csv");
  const text = await response.text();

  const lines = text.split("\n").slice(1);

  return lines.map(line => {
    const [pregunta, respuesta, explicacion] = line.split(",");

    return {
      text: pregunta,
      correct: respuesta.trim() === "T",
      explanation: explicacion ? explicacion.trim() : ""
    };
  });
}

// ---------------- Shuffle ----------------
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ---------------- INIT ----------------
async function init() {
  questions = await loadCSV();
  shuffle(questions);
  loadQuestion();
}

// ---------------- LOAD QUESTION ----------------
function loadQuestion() {
  const q = questions[current];

  document.getElementById("question").innerText = q.text;

  const result = document.getElementById("result");
  result.innerText = "";
  result.className = "feedback";

  // activar botones
  document.getElementById("trueBtn").disabled = false;
  document.getElementById("falseBtn").disabled = false;

  // desactivar siguiente
  document.getElementById("nextBtn").disabled = true;

  updateUI();
}

// ---------------- ANSWER ----------------
function answer(userAnswer) {
  const q = questions[current];
  const result = document.getElementById("result");

  // bloquear botones
  document.getElementById("trueBtn").disabled = true;
  document.getElementById("falseBtn").disabled = true;

  const key = q.text;

  // inicializar stats si no existe
  if (!stats[key]) {
    stats[key] = { fails: 0 };
  }

  // puntos decrecientes
  let points = 10 / Math.pow(2, stats[key].fails);

  if (userAnswer === q.correct) {
    score += points;

    result.innerText =
      `✅ Correcto (+${points.toFixed(1)} pts)\n` + q.explanation;
    result.className = "feedback correct";
  } else {
    stats[key].fails++; // 🔥 aumenta fallos
    wrongQuestions.push(q);

    result.innerText =
      `❌ Incorrecto (era ${q.correct ? "Verdadero" : "Falso"})\n` +
      q.explanation;
    result.className = "feedback incorrect";
  }

  // activar botón siguiente
  document.getElementById("nextBtn").disabled = false;

  updateUI();
}

// ---------------- NEXT ----------------
function nextQuestion() {
  current++;

  if (current < questions.length) {
    loadQuestion();
  } else {
    nextRound();
  }
}

// ---------------- NEXT ROUND ----------------
function nextRound() {
  if (wrongQuestions.length === 0) {
    endTest();
    return;
  }

  questions = [...wrongQuestions];
  wrongQuestions = [];
  current = 0;
  round++;

  shuffle(questions);

  const result = document.getElementById("result");
  result.innerText =
    `⚠️ Nueva ronda con ${questions.length} preguntas falladas`;
  result.className = "feedback";

  setTimeout(loadQuestion, 1000);
}

// ---------------- END ----------------
function endTest() {
  document.getElementById("question").innerText =
    "🔥 Dominado. No has fallado ninguna en la última ronda.";

  document.getElementById("result").innerText =
    "Puntuación total: " + Math.floor(score);

  document.getElementById("nextBtn").disabled = true;
}

// ---------------- UI ----------------
function updateUI() {
  document.getElementById("score").innerText = Math.floor(score);
  document.getElementById("roundText").innerText = round;

  document.getElementById("progressText").innerText =
    `Pregunta ${current + 1} de ${questions.length}`;

  const progress = (current / questions.length) * 100;
  document.getElementById("progressBar").style.width = progress + "%";
}

// ---------------- START ----------------
init();