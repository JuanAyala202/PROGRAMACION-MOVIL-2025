import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [theme, setTheme] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const themes = ['moda', 'historia', 'ciencia', 'deporte', 'arte'];

  const startQuiz = async (selectedTheme) => {
    setTheme(selectedTheme);
    try {
      const response = await axios.get(`http://localhost:5000/questions/${selectedTheme}`);
      setQuestions(response.data);
    } catch (error) {
      console.error("Error al obtener las preguntas:", error);
    }
  };

  const handleAnswer = (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;  // Añadido para evitar el error de undefined
    const isCorrect = currentQuestion.answer === answer;
    setUserAnswers([...userAnswers, { question: currentQuestion.question, answer, isCorrect }]);
    if (isCorrect) {
      setScore(score + 1);
    }
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
      saveAnswers();
    }
  };

  const saveAnswers = async () => {
    for (const userAnswer of userAnswers) {
      await axios.post('http://localhost:5000/save-answer', {
        theme,
        question: userAnswer.question,
        userAnswer: userAnswer.answer,
        correctAnswer: questions.find(q => q.question === userAnswer.question).answer,
        score: userAnswer.isCorrect ? 1 : 0,
      });
    }
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1>Quiz de Conocimiento</h1>
      {!theme ? (
        <div>
          {themes.map((t) => (
            <button key={t} onClick={() => startQuiz(t)} style={{ margin: '10px', padding: '10px', fontSize: '16px' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <h2>Tema: {theme.charAt(0).toUpperCase() + theme.slice(1)}</h2>
          {!quizCompleted ? (
            <div>
              {questions[currentQuestionIndex] ? (
                <div>
                  <h3>{questions[currentQuestionIndex].question}</h3>
                  <div>
                    {questions[currentQuestionIndex].options.map((option, index) => (
                      <button key={index} onClick={() => handleAnswer(option)} style={{ margin: '5px', padding: '10px', fontSize: '16px' }}>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p>Cargando pregunta...</p>
              )}
            </div>
          ) : (
            <div>
              <h2>¡Quiz Terminado!</h2>
              <p>Tu puntaje es: {score} de {questions.length}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
