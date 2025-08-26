import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';

const CreateExam = () => {
    const [title, setTitle] = useState('');
    const [timeLimit, setTimeLimit] = useState(30); // Default 30 minutes
    const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], answer: '' }]);

    const addQuestion = () => {
        setQuestions([...questions, { question: '', options: ['', '', '', ''], answer: '' }]);
    };

    const handleChangeQuestion = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].question = value;
        setQuestions(newQuestions);
    };

    const handleChangeOption = (index, optionIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[index].options[optionIndex] = value;
        setQuestions(newQuestions);
    };

    const handleChangeAnswer = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].answer = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('Form submitted, validating data...');
        
        // Validate form data
        if (!title.trim()) {
            alert('Please enter an exam title');
            return;
        }
        
        if (timeLimit < 1 || timeLimit > 300) {
            alert('Time limit must be between 1 and 300 minutes');
            return;
        }
        
        // Validate questions
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question.trim()) {
                alert(`Please enter question ${i + 1}`);
                return;
            }
            
            for (let j = 0; j < q.options.length; j++) {
                if (!q.options[j].trim()) {
                    alert(`Please enter option ${j + 1} for question ${i + 1}`);
                    return;
                }
            }
            
            if (!q.answer.trim()) {
                alert(`Please enter the correct answer for question ${i + 1}`);
                return;
            }
        }
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You must be logged in to create an exam');
                return;
            }
            
            console.log('Token found, checking API connection...');
            console.log('API URL:', API_URL);
            console.log('Submitting exam with data:', { title, timeLimit, questions });
            
            const response = await axios.post(`${API_URL}/exams`, { title, timeLimit, questions }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('Exam created successfully:', response.data);
            alert('Exam created successfully!');
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Error creating exam:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            });
            
            if (error.response) {
                if (error.response.status === 401) {
                    alert('Authentication failed. Please log in again.');
                } else if (error.response.status === 400) {
                    alert(`Validation Error: ${error.response.data.message || 'Invalid data provided'}`);
                } else {
                    alert(`Server Error: ${error.response.data.message || 'Failed to create exam'}`);
                }
            } else if (error.code === 'ERR_NETWORK') {
                alert('Network error. Please check if the backend server is running on port 5000.');
            } else {
                alert(`Error: ${error.message}`);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">Create Exam</h2>
            <input
                type="text"
                placeholder="Exam Title"
                onChange={(e) => setTitle(e.target.value)}
                className="border border-gray-300 p-2 mb-4 w-full"
                required
            />
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                </label>
                <input
                    type="number"
                    min="1"
                    max="300"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 1)}
                    className="border border-gray-300 p-2 w-full"
                    required
                />
                <p className="text-sm text-gray-500 mt-1">Enter the time limit in minutes (1-300)</p>
            </div>
            {questions.map((q, index) => (
                <div key={index} className="mb-4">
                    <input
                        type="text"
                        placeholder="Question"
                        onChange={(e) => handleChangeQuestion(index, e.target.value)}
                        className="border border-gray-300 p-2 mb-2 w-full"
                        required
                    />
                    {q.options.map((option, optionIndex) => (
                        <input
                            key={optionIndex}
                            type="text"
                            placeholder={`Option ${optionIndex + 1}`}
                            onChange={(e) => handleChangeOption(index, optionIndex, e.target.value)}
                            className="border border-gray-300 p-2 mb-2 w-full"
                            required
                        />
                    ))}
                    <input
                        type="text"
                        placeholder="Correct Answer"
                        onChange={(e) => handleChangeAnswer(index, e.target.value)}
                        className="border border-gray-300 p-2 mb-2 w-full"
                        required
                    />
                </div>
            ))}
            <button type="button" onClick={addQuestion} className="bg-blue-600 text-white p-2 mr-3 rounded mb-4">Add Question</button>
            <button type="submit" className="bg-blue-600 text-white p-2 rounded">Create Exam</button>
        </form>
    );
};

export default CreateExam;