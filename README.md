# Exam Practice WebApp

A simple web-based quiz application for exam practice with three different question types.

## Features

- **Section I - MCQ (Multiple Choice Questions)**: Select one best answer
- **Section II - Fill in the Blank**: Type precise answers with optional hints
- **Section III - Multiple Answers**: Select multiple correct answers with penalty for wrong selections
- **Score Calculation**: Automatic scoring with detailed results
- **Navigation**: Move between questions freely
- **Progress Tracking**: See which question you're on
- **Results Modal**: View detailed feedback after submission

## Files

- `index.html` - Main HTML structure
- `style.css` - Styling and responsive design
- `script.js` - Quiz logic and interactivity
- `questions.json` - Quiz questions data

## How to Use

1. **Edit `questions.json`** with your exam questions
2. **Open `index.html`** in a web browser
3. **Answer questions** by selecting options or typing answers
4. **Navigate** using Previous/Next buttons
5. **Submit** your quiz to see results and score

## JSON Format Guide

### MCQ Question

```json
{
  "type": "mcq",
  "question": "What is the capital of France?",
  "options": ["London", "Paris", "Berlin", "Madrid"],
  "correctAnswer": 1,
  "points": 20
}
```

- `type`: Must be `"mcq"`
- `question`: The question text
- `options`: Array of answer choices (0-indexed)
- `correctAnswer`: Index of the correct option (0-based)
- `points`: Points for this question

### Fill in the Blank Question

```json
{
  "type": "fill",
  "question": "The largest planet is ________.",
  "correctAnswers": ["Jupiter", "jupiter"],
  "hint": "Starts with 'J'",
  "points": 10
}
```

- `type`: Must be `"fill"`
- `question`: Use `________` as placeholder for the blank
- `correctAnswers`: Array of acceptable answers (case variations)
- `hint`: Optional hint shown below the input (remove if not needed)
- `points`: Points for this question

### Multiple Answers Question

```json
{
  "type": "multiple",
  "question": "Which of the following are primary colors?",
  "options": ["Red", "Green", "Blue", "Yellow", "Orange"],
  "correctAnswers": [0, 2, 3],
  "points": 12
}
```

- `type`: Must be `"multiple"`
- `question`: The question text
- `options`: Array of answer choices
- `correctAnswers`: Array of indices of all correct answers
- `points`: Points for this question
- **Scoring**: User gets full points only if all selections are correct. Selecting wrong answers results in penalty.

## Complete JSON Template

```json
{
  "questions": [
    {
      "type": "mcq",
      "question": "Your MCQ question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "points": 20
    },
    {
      "type": "fill",
      "question": "Fill this ________.",
      "correctAnswers": ["Answer", "answer"],
      "hint": "Helpful hint",
      "points": 10
    },
    {
      "type": "multiple",
      "question": "Select all that apply?",
      "options": ["Option A", "Option B", "Option C"],
      "correctAnswers": [0, 2],
      "points": 12
    }
  ]
}
```

## Scoring Rules

- **MCQ**: Full points if correct, 0 if wrong
- **Fill in the Blank**: Full points if exact match (case-insensitive), 0 if wrong
- **Multiple Answers**:
  - Full points if all correct answers selected and no wrong answers
  - Partial points for partial correct answers
  - Penalty for selecting wrong answers (formula: correct - wrong × 0.5)
  - 0 points if no correct answers selected

## Tips for Creating Questions

1. Use consistent formatting in your questions
2. For fill-in-the-blank, add multiple acceptable answers for variations (e.g., "H2O" and "h2o")
3. For multiple answers, ensure there are truly multiple correct answers
4. Balance points across sections based on difficulty
5. Test with sample questions before adding real exam content

## Browser Compatibility

Works in all modern browsers (Chrome, Firefox, Safari, Edge)
