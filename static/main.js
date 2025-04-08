// static/main.js

let words = [];
let selectedWords = [];
let score = 0;
let currentQuestion = 0;
let totalQuestions = 0;
let wrongAnswers = [];
let timer;
let timeLeft = 10;

async function fetchWords() {
    const response = await fetch('/get_words');
    words = await response.json();
    showStartScreen();
}

function showStartScreen() {
    document.getElementById("game-container").classList.add("hidden");
    document.getElementById("result-screen").classList.add("hidden");
    document.getElementById("start-screen").classList.remove("hidden");
}

function startGame(numQuestions) {
    totalQuestions = numQuestions;
    score = 0;
    currentQuestion = 0;
    wrongAnswers = [];
    selectedWords = shuffle(words).slice(0, numQuestions);
    document.getElementById("score").innerText = `分數: 0`;
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("game-container").classList.remove("hidden");
    showQuestion();
}

function showQuestion() {
    if (currentQuestion >= totalQuestions) {
        showResult();
        return;
    }
    clearInterval(timer);
    timeLeft = 10;
    document.getElementById("time-left").innerText = `剩餘時間: ${timeLeft} 秒`;

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("time-left").innerText = `剩餘時間: ${timeLeft} 秒`;
        if (timeLeft === 0) {
            clearInterval(timer);
            wrongAnswers.push({ word: selectedWords[currentQuestion].word, selected: "未作答", correct: selectedWords[currentQuestion].meaning });
            currentQuestion++;
            showQuestion();
        }
    }, 1000);

    const wordData = selectedWords[currentQuestion];
    document.getElementById("word").innerText = wordData.word;
    speak(wordData.word);

    const options = [wordData.meaning, ...shuffle(words.map(w => w.meaning).filter(m => m !== wordData.meaning)).slice(0, 3)];
    shuffle(options);

    document.getElementById("options").innerHTML = options.map(option =>
        `<button class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 ease-in-out"
            onclick="checkAnswer(this, '${option}', '${wordData.meaning}')">${option}</button>`
    ).join(" ");

    document.getElementById("speak-btn").setAttribute("onclick", `speak('${wordData.word}')`);
}

function checkAnswer(button, selected, correct) {
    clearInterval(timer);
    if (selected === correct) {
        button.classList.add("bg-green-500");
        score++;
        document.getElementById("score").innerText = `分數: ${score}`;
    } else {
        button.classList.add("bg-red-500");
        wrongAnswers.push({ word: selectedWords[currentQuestion].word, selected, correct });
    }

    setTimeout(() => {
        button.classList.remove("bg-green-500", "bg-red-500");
        currentQuestion++;
        showQuestion();
    }, 800);
}

function showResult() {
    clearInterval(timer);
    document.getElementById("game-container").classList.add("hidden");
    document.getElementById("result-screen").classList.remove("hidden");
    document.getElementById("final-score").innerText = `你的最終分數: ${score} / ${totalQuestions}`;

    let reviewHTML = "<h3 class='text-lg font-bold text-red-600'>錯誤題目回顧：</h3><ul class='mt-2 text-gray-700'>";
    if (wrongAnswers.length > 0) {
        wrongAnswers.forEach(q => {
            reviewHTML += `<li class="mt-1">❌ <b>${q.word}</b> 你的答案: <span class="text-red-500">${q.selected}</span> → 正確答案: <span class="text-green-500">${q.correct}</span></li>`;
        });
    } else {
        reviewHTML = "<p class='text-green-600 font-bold'>🎉 全部答對！太厲害了！</p>";
    }
    reviewHTML += "</ul>";
    document.getElementById("review-section").innerHTML = reviewHTML;
}

function endGame() {
    showResult();
}

function restartGame() {
    document.getElementById("result-screen").classList.add("hidden");
    showStartScreen();
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function speak(text) {
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
}

window.onload = fetchWords;
