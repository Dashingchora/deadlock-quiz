// 🔗 REPLACE WITH YOUR DEPLOYED WEB APP URL


const GOOGLE_SHEET_URL ="https://script.google.com/macros/s/AKfycbyYzkwd1KkoQkcIKdYZEr26kjEiKwl7NNqGeVvBn60k8Sxhg5Nc69bcAz8cYTYFLiV3/exec";

// Questions
const questions = [
  {
    q: "What is a deadlock in DBMS?",
    options: [
      "Two transactions waiting for each other indefinitely",
      "System crash during transaction",
      "Transaction rollback failure",
      "Data inconsistency"
    ],
    answer: 0
  },
  {
    q: "Which condition is necessary for a deadlock?",
    options: ["Circular Wait", "No Preemption", "Hold and Wait", "All of the above"],
    answer: 3
  },
  {
    q: "Which of the following prevents deadlock?",
    options: ["Wait-Die", "No Waiting", "Rollback", "Timestamp ordering"],
    answer: 0
  }
];

const form = document.getElementById("quizForm");
const resultDiv = document.getElementById("result");

// Render quiz
questions.forEach((q, i) => {
  const div = document.createElement("div");
  div.innerHTML = `<h4>${i + 1}. ${q.q}</h4>` +
    q.options.map((opt, j) => `
      <label>
        <input type="radio" name="q${i}" value="${j}" required> ${opt}
      </label><br>
    `).join("");
  form.appendChild(div);
});

// Timer (5 min)
let time = 300;
const timerEl = document.getElementById("timer");
const countdown = setInterval(() => {
  const m = Math.floor(time / 60);
  const s = time % 60;
  timerEl.textContent = `Time Left: ${m}:${s < 10 ? "0" + s : s}`;
  if (time-- <= 0) submitQuiz();
}, 1000);

// Anti-cheat
history.pushState(null, null, location.href);
window.onpopstate = () => history.go(1);

// Submit
document.getElementById("submitQuiz").addEventListener("click", submitQuiz);

function submitQuiz() {
  clearInterval(countdown);
  let score = 0;
  const answers = [];

  questions.forEach((q, i) => {
    const chosen = document.querySelector(`input[name="q${i}"]:checked`);
    const ans = chosen ? parseInt(chosen.value) : -1;
    answers.push({ question: q.q, selected: ans, correct: q.answer });
    if (ans === q.answer) score++;
  });

  // Display results with answers
  resultDiv.innerHTML = `<h3>Your Score: ${score}/${questions.length}</h3>`;
  answers.forEach((a, i) => {
    const isCorrect = a.selected === a.correct;
    const selectedText = a.selected >= 0 ? questions[i].options[a.selected] : "Not Answered";
    resultDiv.innerHTML += `
      <p><strong>Q${i + 1}:</strong> ${a.question}<br>
      Your Answer: <span style="color:${isCorrect ? 'green' : 'red'}">${selectedText}</span><br>
      Correct Answer: <b>${questions[i].options[a.correct]}</b></p>
    `;
  });

  document.getElementById("submitQuiz").disabled = true;

  // Send to Google Sheet
  fetch(GOOGLE_SHEET_URL, {
    method: "POST",
    body: JSON.stringify({
      name: localStorage.getItem("userName"),
      email: localStorage.getItem("userEmail"),
      score,
      answers
    }),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(data => {
      console.log("Saved:", data);
      localStorage.setItem("quizScore", score);
      setTimeout(() => window.location.href = "thankyou.html", 3000);
    })
    .catch(err => {
      console.error(err);
      alert("Error saving data. Check Apps Script permissions.");
    });
}
