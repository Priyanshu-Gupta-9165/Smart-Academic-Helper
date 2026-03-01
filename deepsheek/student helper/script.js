document.addEventListener('DOMContentLoaded', () => {
    fetchQuestions();
});

function fetchQuestions() {
    fetch('https://jsonplaceholder.typicode.com/posts')
        .then(response => response.json())
        .then(posts => {
            // Display the first 5 posts as questions
            const questions = posts.slice(0, 5);
            questions.forEach(question => {
                displayQuestion(question);
            });
        })
        .catch(error => console.error('Error fetching questions:', error));
}

function displayQuestion(question) {
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question');
    questionDiv.innerHTML = `<h3>${question.title}</h3><p>${question.body}</p>`;
    
    const answersDiv = document.createElement('div');
    answersDiv.classList.add('answers');
    answersDiv.innerHTML = '<p>Loading answers...</p>';
    questionDiv.appendChild(answersDiv);
    
    document.getElementById('questions-container').appendChild(questionDiv);
    
    // Fetch answers (comments) for the question
    fetch(`https://jsonplaceholder.typicode.com/posts/${question.id}/comments`)
        .then(response => response.json())
        .then(comments => {
            answersDiv.innerHTML = '';
            if (comments.length === 0) {
                answersDiv.innerHTML = '<p>No answers yet.</p>';
            } else {
                comments.forEach(comment => {
                    const answerP = document.createElement('p');
                    answerP.classList.add('answer');
                    answerP.textContent = comment.body;
                    answersDiv.appendChild(answerP);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching answers:', error);
            answersDiv.innerHTML = '<p>Error loading answers.</p>';
        });
}

document.getElementById('question-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const questionTitle = document.getElementById('question-title').value;
    const questionText = document.getElementById('question-text').value;
    if (questionTitle.trim() === '' || questionText.trim() === '') return;
    
    // Simulate posting a new question to the API
    fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: questionTitle,
            body: questionText,
            userId: 1 // Default user ID
        })
    })
    .then(response => response.json())
    .then(newQuestion => {
        displayNewQuestion(newQuestion);
        document.getElementById('question-title').value = '';
        document.getElementById('question-text').value = '';
    })
    .catch(error => console.error('Error posting question:', error));
});

function displayNewQuestion(question) {
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question');
    questionDiv.innerHTML = `<h3>${question.title}</h3><p>${question.body}</p>`;
    const answersDiv = document.createElement('div');
    answersDiv.classList.add('answers');
    answersDiv.innerHTML = '<p>No answers yet.</p>';
    questionDiv.appendChild(answersDiv);
    document.getElementById('questions-container').prepend(questionDiv);
}