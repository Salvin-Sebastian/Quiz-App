// State
let questions = []; // Active questions for the current quiz run
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = []; // Array to store user's answers for the summary

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const questionTracker = document.getElementById('question-tracker');
const scoreTracker = document.getElementById('score-tracker');
const progressFill = document.getElementById('progress-fill');

const finalScore = document.getElementById('final-score');
const totalQuestionsEl = document.getElementById('total-questions');
const summaryContainer = document.getElementById('summary-container');

// Event Listeners
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', handleNext);
restartBtn.addEventListener('click', restartQuiz);

// Dropdown Logic
const customDropdown = document.getElementById('custom-category-dropdown');
const dropdownSelected = document.getElementById('dropdown-selected');
const dropdownOptions = document.getElementById('dropdown-options');
const optionsList = document.querySelectorAll('.dropdown-option');

let selectedCategoryValue = 'All'; // default

dropdownSelected.addEventListener('click', () => {
  customDropdown.classList.toggle('open');
});

optionsList.forEach(option => {
  option.addEventListener('click', () => {
    // Update selected text and value
    dropdownSelected.textContent = option.textContent;
    selectedCategoryValue = option.getAttribute('data-value');
    
    // Update active class
    optionsList.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    
    // Close dropdown
    customDropdown.classList.remove('open');
  });
});

// Close dropdown if clicked outside
document.addEventListener('click', (e) => {
  if (!customDropdown.contains(e.target)) {
    customDropdown.classList.remove('open');
  }
});

function startQuiz() {
  if (selectedCategoryValue === "All") {
    questions = Object.values(questionBank).flat();
  } else {
    questions = questionBank[selectedCategoryValue];
  }
  
  // Shuffle questions for a dynamic experience
  questions.sort(() => Math.random() - 0.5);

  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  
  startScreen.classList.remove('active');
  quizScreen.classList.add('active');
  resultScreen.classList.remove('active');
  
  loadQuestion();
}

function loadQuestion() {
  resetState();
  const currentQuestion = questions[currentQuestionIndex];
  
  // Update trackers
  questionTracker.textContent = `Question ${currentQuestionIndex + 1}/${questions.length}`;
  scoreTracker.textContent = `Score: ${score}`;
  
  // Update progress bar
  const progress = ((currentQuestionIndex) / questions.length) * 100;
  progressFill.style.width = `${progress}%`;
  
  // Set question text
  questionText.textContent = currentQuestion.question;
  
  // Create option buttons
  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.textContent = option;
    button.classList.add('option-btn');
    button.addEventListener('click', () => selectOption(index, button));
    optionsContainer.appendChild(button);
  });
}

function resetState() {
  nextBtn.classList.add('hidden');
  while (optionsContainer.firstChild) {
    optionsContainer.removeChild(optionsContainer.firstChild);
  }
}

function selectOption(selectedIndex, selectedButton) {
  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedIndex === currentQuestion.answer;
  
  // Record answer for summary
  userAnswers.push({
    question: currentQuestion.question,
    userAnswer: currentQuestion.options[selectedIndex],
    correctAnswer: currentQuestion.options[currentQuestion.answer],
    isCorrect: isCorrect
  });

  if (isCorrect) {
    selectedButton.classList.add('correct');
    score++;
    scoreTracker.textContent = `Score: ${score}`;
  } else {
    selectedButton.classList.add('wrong');
    // Highlight the correct answer as well
    const optionButtons = optionsContainer.querySelectorAll('.option-btn');
    optionButtons[currentQuestion.answer].classList.add('correct');
  }
  
  // Disable all buttons
  const optionButtons = optionsContainer.querySelectorAll('.option-btn');
  optionButtons.forEach(btn => btn.disabled = true);
  
  // Show next button
  nextBtn.classList.remove('hidden');
  
  // Update progress bar if it's the last question
  if (currentQuestionIndex === questions.length - 1) {
    progressFill.style.width = `100%`;
    nextBtn.textContent = 'Finish Quiz';
  }
}

function handleNext() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  quizScreen.classList.remove('active');
  resultScreen.classList.add('active');
  
  finalScore.textContent = score;
  totalQuestionsEl.textContent = questions.length;
  
  generateSummary();
}

function generateSummary() {
  summaryContainer.innerHTML = '';
  
  userAnswers.forEach((answer, index) => {
    const item = document.createElement('div');
    item.classList.add('summary-item');
    item.classList.add(answer.isCorrect ? 'correct-item' : 'wrong-item');
    
    let answerFeedback = '';
    if (answer.isCorrect) {
      answerFeedback = `<div class="summary-answer">Your answer: <span class="correct-text">${answer.userAnswer}</span></div>`;
    } else {
      answerFeedback = `
        <div class="summary-answer">Your answer: <span class="wrong-text">${answer.userAnswer}</span></div>
        <div class="summary-answer">Correct answer: <span class="correct-text">${answer.correctAnswer}</span></div>
      `;
    }

    item.innerHTML = `
      <div class="summary-question">${index + 1}. ${answer.question}</div>
      ${answerFeedback}
    `;
    
    summaryContainer.appendChild(item);
  });
}

function restartQuiz() {
  nextBtn.textContent = 'Next Question';
  startQuiz();
}
