let questions = [];
let wrongQuestions = [];

let current = 0;
let score = 0;
let round = 1;

let stats = {};
const answerLabels = ["Verdadero", "Falso"];

// ---------------- CSV ----------------
async function loadCSV() {
  const response = await fetch("preguntas.csv");
  const text = await response.text();

  const lines = text.trim().split(/\r?\n/).slice(1);

  return lines.map(line => {
    const [pregunta, correcta, explicacion = ""] = line.split(";");

    return {
      text: pregunta.trim(),
      correct: parseInt(correcta.trim(), 10),
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

  const container = document.getElementById("optionsContainer");
  container.innerHTML = "";

  answerLabels.forEach((label, index) => {
    const btn = document.createElement("button");
    btn.className = `btn ${index === 0 ? "btn--true" : "btn--false"}`;
    btn.innerText = label;
    btn.onclick = () => answer(index);
    container.appendChild(btn);
  });

  const result = document.getElementById("result");
  result.innerText = "";
  result.className = "feedback";

  document.getElementById("nextBtn").disabled = true;

  updateUI();
}

// ---------------- ANSWER ----------------
function answer(userAnswer) {
  const q = questions[current];
  const result = document.getElementById("result");

  const buttons = document.querySelectorAll("#optionsContainer button");
  buttons.forEach(btn => btn.disabled = true);

  const key = q.text;

  if (!stats[key]) {
    stats[key] = { fails: 0 };
  }

  if (userAnswer === q.correct) {
    score += 1;

    result.innerText = `✅ Correcto (+1)\n${q.explanation}`;
    result.className = "feedback correct";
  } else {
    score -= 0.25;
    stats[key].fails++;
    wrongQuestions.push(q);

    result.innerText =
      `❌ Incorrecto (correcta: ${answerLabels[q.correct]})\n${q.explanation}`;
    result.className = "feedback incorrect";
  }

  buttons.forEach((btn, index) => {
    if (index === q.correct) {
      btn.classList.add("correct");
    } else if (index === userAnswer) {
      btn.classList.add("incorrect");
    }
  });

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
  result.innerText = `⚠️ Nueva ronda con ${questions.length} preguntas falladas`;
  result.className = "feedback";

  setTimeout(loadQuestion, 1000);
}

// ---------------- END ----------------
function endTest() {
  document.getElementById("question").innerText =
    "Banco completado. Revisa las falladas para reforzar el temario.";

  document.getElementById("result").innerText =
    "Puntuación total: " + score.toFixed(2);

  document.getElementById("nextBtn").disabled = true;
}

// ---------------- UI ----------------
function updateUI() {
  document.getElementById("score").innerText = score.toFixed(2);
  document.getElementById("roundText").innerText = round;

  document.getElementById("progressText").innerText =
    `Pregunta ${current + 1} de ${questions.length}`;

  const progress = (current / questions.length) * 100;
  document.getElementById("progressBar").style.width = progress + "%";
}

// ---------------- START ----------------
init();
