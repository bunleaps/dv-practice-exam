let quizData = [];
let currentQuestion = 0;
let answers = {};
let score = 0;
let showResults = false;
let questionFeedback = {}; // Track feedback for each question

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffled = [...array]; // Create a copy
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Load quiz data from JSON file
async function loadQuiz() {
  try {
    // Try to load from external questions.json (with cache busting)
    let response;
    const paths = [
      "./questions.json?t=" + new Date().getTime(),
      "/questions.json?t=" + new Date().getTime(),
      "questions.json?t=" + new Date().getTime(),
    ];

    for (let path of paths) {
      try {
        response = await fetch(path);
        if (response.ok) {
          console.log(`✓ Loaded from external JSON`);
          const data = await response.json();
          if (data.questions && Array.isArray(data.questions)) {
            quizData = shuffleArray(data.questions);
            console.log(`✓ Questions shuffled randomly`);
            initializeAnswers();
            renderQuestion();
            return;
          }
        }
      } catch (e) {
        // Continue to next path
      }
    }

    // Fallback: try to load from embedded data in the page
    const embeddedScript = document.querySelector(
      'script[type="application/json"]#questions-data'
    );
    if (embeddedScript) {
      console.log("✓ Loaded from embedded data (fallback)");
      const data = JSON.parse(embeddedScript.textContent);
      if (data.questions && Array.isArray(data.questions)) {
        quizData = shuffleArray(data.questions);
        console.log(`✓ Questions shuffled randomly`);
        initializeAnswers();
        renderQuestion();
        return;
      }
    }

    throw new Error("Could not load questions from any source");
  } catch (error) {
    console.error("Error loading quiz:", error);
    document.getElementById("quizContent").innerHTML = `
      <div style="padding: 20px; background: #ffebee; border-radius: 8px; color: #c62828;">
        <h3>❌ Error Loading Quiz</h3>
        <p><strong>Issue:</strong> ${error.message}</p>
        <p><strong>Solutions:</strong></p>
        <ol>
          <li><strong>✅ EASIEST - Use the embedded version:</strong>
            <ul>
              <li>Open <code>index-embedded.html</code> instead of <code>index.html</code></li>
              <li>No server needed! Works offline!</li>
            </ul>
          </li>
          <li><strong>OR use a local server:</strong>
            <ul>
              <li><strong>Node.js:</strong> Run <code>node server.js</code> in terminal, then open http://localhost:3000</li>
              <li><strong>Python:</strong> Run <code>python -m http.server 3000</code> in terminal, then open http://localhost:3000</li>
              <li><strong>VS Code:</strong> Install "Live Server" extension, right-click index.html, click "Open with Live Server"</li>
            </ul>
          </li>
        </ol>
        <p style="margin-top: 15px; font-size: 12px; opacity: 0.7;">Check browser console (F12) for more details.</p>
      </div>
    `;
  }
}

// Initialize answers object
function initializeAnswers() {
  answers = {};
  questionFeedback = {};
  quizData.forEach((q, idx) => {
    if (q.type === "mcq") {
      answers[idx] = null;
    } else if (q.type === "fill") {
      answers[idx] = "";
    } else if (q.type === "multiple") {
      answers[idx] = [];
    }
    questionFeedback[idx] = null; // null = not answered, true = correct, false = wrong
  });
}

// Check if answer is correct and provide instant feedback
function checkAnswer(questionIdx) {
  const question = quizData[questionIdx];
  const userAnswer = answers[questionIdx];
  let isCorrect = false;

  if (question.type === "mcq") {
    isCorrect = userAnswer === question.correctAnswer;
  } else if (question.type === "fill") {
    const correctAnswers = question.correctAnswers.map((a) =>
      a.toLowerCase().trim()
    );
    isCorrect = correctAnswers.includes(userAnswer.toLowerCase());
  } else if (question.type === "multiple") {
    const userSet = new Set(userAnswer);
    const correctSet = new Set(question.correctAnswers);
    const hasAllCorrect = question.correctAnswers.every((i) => userSet.has(i));
    const hasNoWrong = userAnswer.every((i) =>
      question.correctAnswers.includes(i)
    );
    isCorrect = hasAllCorrect && hasNoWrong;
  }

  questionFeedback[questionIdx] = isCorrect;
  updateScore();
  renderQuestion();
  return isCorrect;
}

// Update score display in real-time
function updateScore() {
  let totalScore = 0;
  quizData.forEach((question, idx) => {
    if (questionFeedback[idx] === true) {
      totalScore += question.points;
    }
  });
  score = totalScore;
  document.getElementById("score").textContent = `Score: ${Math.round(score)}`;
}

// Render current question
function renderQuestion() {
  const question = quizData[currentQuestion];
  const content = document.getElementById("quizContent");

  let html = `
        <div class="question-container">
            <div class="question-header">
                <span class="question-type">${getQuestionTypeLabel(
                  question.type
                )}</span>
                <span class="points">${question.points} points</span>
            </div>
            <div class="question-text">${question.question}</div>
    `;

  if (question.type === "mcq") {
    html += renderMCQ(question);
  } else if (question.type === "fill") {
    html += renderFill(question);
  } else if (question.type === "multiple") {
    html += renderMultiple(question);
  }

  html += "</div>";
  content.innerHTML = html;

  updateNavigation();
  updateProgress();
}

// Render MCQ
function renderMCQ(question) {
  let html = '<div class="options">';
  const feedback = questionFeedback[currentQuestion];

  question.options.forEach((option, idx) => {
    const isSelected = answers[currentQuestion] === idx;
    let optionClass = isSelected ? "selected" : "";

    // Show feedback styling if question has been checked
    if (feedback !== null) {
      if (idx === question.correctAnswer) {
        optionClass += " correct";
      } else if (isSelected && idx !== question.correctAnswer) {
        optionClass += " incorrect";
      }
    }

    html += `
            <div class="option ${optionClass}" onclick="selectMCQ(${idx})">
                <input type="radio" name="option" value="${idx}" ${
      isSelected ? "checked" : ""
    } ${feedback !== null ? "disabled" : ""}>
                <label>${option}</label>
            </div>
        `;
  });

  // Add feedback message if checked
  if (feedback !== null) {
    const message = feedback ? "✓ Correct!" : "✗ Wrong! Try to understand why.";
    const bgColor = feedback ? "#d4edda" : "#f8d7da";
    const textColor = feedback ? "#155724" : "#721c24";
    html += `<div style="margin-top: 15px; padding: 12px; background: ${bgColor}; color: ${textColor}; border-radius: 6px; font-weight: bold; text-align: center;">${message}</div>`;
  }

  html += "</div>";
  return html;
}

// Render Fill in the blank
function renderFill(question) {
  let html = '<div class="fill-input-container">';
  const feedback = questionFeedback[currentQuestion];

  let inputClass = "";
  if (feedback !== null) {
    inputClass = feedback ? "correct" : "incorrect";
  }

  html += `<input type="text" id="fillInput" placeholder="Type your answer here" value="${
    answers[currentQuestion]
  }" onchange="selectFill(this.value)" ${
    feedback !== null ? "disabled" : ""
  } class="${inputClass}">`;

  if (question.hint) {
    html += `<div class="hint">Hint: ${question.hint}</div>`;
  }

  // Add feedback message if checked
  if (feedback !== null) {
    const message = feedback
      ? "✓ Correct!"
      : `✗ Wrong! Correct answer: ${question.correctAnswers.join(" / ")}`;
    const bgColor = feedback ? "#d4edda" : "#f8d7da";
    const textColor = feedback ? "#155724" : "#721c24";
    html += `<div style="margin-top: 15px; padding: 12px; background: ${bgColor}; color: ${textColor}; border-radius: 6px; font-weight: bold;">${message}</div>`;
  }

  html += "</div>";
  return html;
}

// Render Multiple answers
function renderMultiple(question) {
  let html = '<div class="options">';
  const feedback = questionFeedback[currentQuestion];

  question.options.forEach((option, idx) => {
    const isSelected = answers[currentQuestion].includes(idx);
    let optionClass = isSelected ? "selected" : "";

    // Show feedback styling if question has been checked
    if (feedback !== null) {
      if (question.correctAnswers.includes(idx)) {
        optionClass += " correct";
      } else if (isSelected && !question.correctAnswers.includes(idx)) {
        optionClass += " incorrect";
      }
    }

    html += `
            <div class="option ${optionClass}" onclick="selectMultiple(${idx})">
                <input type="checkbox" value="${idx}" ${
      isSelected ? "checked" : ""
    } ${feedback !== null ? "disabled" : ""}>
                <label>${option}</label>
            </div>
        `;
  });
  html += "</div>";

  // Add feedback message if checked
  if (feedback !== null) {
    const message = feedback
      ? "✓ Correct!"
      : "✗ Wrong! Review the correct answers highlighted above.";
    const bgColor = feedback ? "#d4edda" : "#f8d7da";
    const textColor = feedback ? "#155724" : "#721c24";
    html += `<div style="margin-top: 15px; padding: 12px; background: ${bgColor}; color: ${textColor}; border-radius: 6px; font-weight: bold; text-align: center;">${message}</div>`;
  }

  html +=
    '<div class="hint" style="margin-top: 15px; color: #f44336; font-style: normal;"><strong>⚠️ Note:</strong> Wrong selections result in penalty</div>';
  return html;
}

function getQuestionTypeLabel(type) {
  const labels = {
    mcq: "Section I - MCQ",
    fill: "Section II - Fill in the Blank",
    multiple: "Section III - Multiple Answers",
  };
  return labels[type] || type;
}

// Selection handlers
function selectMCQ(idx) {
  if (questionFeedback[currentQuestion] === null) {
    answers[currentQuestion] = idx;
    renderQuestion();
  }
}

function selectFill(value) {
  answers[currentQuestion] = value.trim();
  renderQuestion();
}

function selectMultiple(idx) {
  if (questionFeedback[currentQuestion] === null) {
    const current = answers[currentQuestion];
    if (current.includes(idx)) {
      answers[currentQuestion] = current.filter((i) => i !== idx);
    } else {
      answers[currentQuestion].push(idx);
    }
    renderQuestion();
  }
}

// Navigation
function checkCurrentQuestion() {
  checkAnswer(currentQuestion);
}

function nextQuestion() {
  // Only allow moving to next if current question is answered
  if (questionFeedback[currentQuestion] === null) {
    alert("Please check your answer first!");
    return;
  }
  if (currentQuestion < quizData.length - 1) {
    currentQuestion++;
    renderQuestion();
    window.scrollTo(0, 0);
  }
}

function previousQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
    window.scrollTo(0, 0);
  }
}

function updateNavigation() {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const checkBtn = document.getElementById("checkBtn");
  const submitBtn = document.getElementById("submitBtn");
  const feedback = questionFeedback[currentQuestion];

  prevBtn.disabled = currentQuestion === 0;

  // Show check button if question not answered
  if (feedback === null) {
    checkBtn.style.display = "block";
    nextBtn.style.display = "none";
    submitBtn.style.display = "none";
  } else {
    checkBtn.style.display = "none";
    if (currentQuestion === quizData.length - 1) {
      nextBtn.style.display = "none";
      submitBtn.style.display = "block";
    } else {
      nextBtn.style.display = "block";
      submitBtn.style.display = "none";
    }
  }
}

function updateProgress() {
  document.getElementById("progress").textContent = `Question ${
    currentQuestion + 1
  } of ${quizData.length}`;
}

// Submit and calculate score
function submitQuiz() {
  calculateScore();
  showResultsModal();
}

function calculateScore() {
  score = 0;
  let details = "";

  quizData.forEach((question, idx) => {
    const userAnswer = answers[idx];
    let isCorrect = false;

    if (question.type === "mcq") {
      isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) {
        score += question.points;
      }
      details += createResultDetail(
        question,
        userAnswer,
        question.correctAnswer,
        isCorrect
      );
    } else if (question.type === "fill") {
      const correctAnswers = question.correctAnswers.map((a) =>
        a.toLowerCase().trim()
      );
      isCorrect = correctAnswers.includes(userAnswer.toLowerCase());
      if (isCorrect) {
        score += question.points;
      }
      details += createResultDetail(
        question,
        userAnswer,
        question.correctAnswers.join(" / "),
        isCorrect
      );
    } else if (question.type === "multiple") {
      const userSet = new Set(userAnswer);
      const correctSet = new Set(question.correctAnswers);

      // Check if answer is correct (all correct and no wrong)
      const hasAllCorrect = question.correctAnswers.every((i) =>
        userSet.has(i)
      );
      const hasNoWrong = userAnswer.every((i) =>
        question.correctAnswers.includes(i)
      );
      isCorrect = hasAllCorrect && hasNoWrong;

      if (isCorrect) {
        score += question.points;
      } else if (hasAllCorrect || hasNoWrong) {
        // Partial credit logic (adjust as needed)
        const correct = userAnswer.filter((i) =>
          question.correctAnswers.includes(i)
        ).length;
        const penalty = userAnswer.filter(
          (i) => !question.correctAnswers.includes(i)
        ).length;
        score += Math.max(
          0,
          (correct - penalty * 0.5) *
            (question.points / question.correctAnswers.length)
        );
      }

      const correctOptions = question.correctAnswers
        .map((i) => question.options[i])
        .join(", ");
      const userOptions =
        userAnswer.length > 0
          ? userAnswer.map((i) => question.options[i]).join(", ")
          : "No answer";
      details += createResultDetail(
        question,
        userOptions,
        correctOptions,
        isCorrect
      );
    }
  });

  document.getElementById("resultDetails").innerHTML = details;
}

function createResultDetail(question, userAnswer, correctAnswer, isCorrect) {
  const status = isCorrect ? "✓" : "✗";
  const className = isCorrect ? "correct" : "incorrect";
  return `
        <div class="result-item ${className}">
            <strong>${status} Q${quizData.indexOf(question) + 1}:</strong> ${
    question.question
  }<br>
            <span style="font-size: 14px;">Your answer: ${
              userAnswer || "No answer"
            }</span><br>
            ${
              !isCorrect
                ? `<span style="font-size: 14px;">Correct answer: ${correctAnswer}</span>`
                : ""
            }
        </div>
    `;
}

function showResultsModal() {
  const totalPoints = quizData.reduce((sum, q) => sum + q.points, 0);
  const percentage = ((score / totalPoints) * 100).toFixed(2);

  document.getElementById(
    "resultTitle"
  ).textContent = `Quiz Complete! Your Score: ${Math.round(
    score
  )}/${totalPoints} (${percentage}%)`;
  document.getElementById("resultModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("resultModal").style.display = "none";
}

function restartQuiz() {
  currentQuestion = 0;
  initializeAnswers();
  score = 0;
  showResults = false;
  closeModal();
  renderQuestion();
  window.scrollTo(0, 0);
}

// Initialize on page load
window.addEventListener("load", loadQuiz);
