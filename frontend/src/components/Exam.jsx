import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../utils/api';

const Exam = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const role = localStorage.getItem('role');
    const [tabSwitches, setTabSwitches] = useState(0);
    const examStartTime = useRef(Date.now());
    const toastIds = useRef({
        copyPaste: null,
        rightClick: null,
        tabSwitch: null,
        keyboardShortcut: null
    });
    const isAutoSubmitting = useRef(false);
    const countdownInterval = useRef(null);
    const modalDiv = useRef(null);
    
    // Function to show a toast with ID to prevent duplicates
    const showToast = (type, message, options = {}) => {
        // Skip if already auto-submitting
        if (isAutoSubmitting.current) return;
        
        // If a toast with this ID already exists, dismiss it first
        if (toastIds.current[type]) {
            toast.dismiss(toastIds.current[type]);
        }
        
        // Show the new toast and store its ID
        toastIds.current[type] = toast.error(message, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            ...options
        });
    };
    
    // Function to handle tab visibility change
    const handleVisibilityChange = () => {
        // Skip if already auto-submitting
        if (isAutoSubmitting.current) return;
        
        if (document.hidden) {
            // User is leaving the tab
            setTabSwitches(prev => {
                const newCount = prev + 1;
                
                // Show toast notification with unique ID
                showToast('tabSwitch', `Warning: You've switched tabs ${newCount}/3 times. After 3 switches, your exam will be submitted automatically.`, {
                    autoClose: 3000
                });
                
                // If reached limit, auto-submit
                if (newCount >= 3) {
                    // Set auto-submitting flag to prevent more toasts
                    isAutoSubmitting.current = true;
                    
                    // Show a modal-like message before auto-submitting
                    modalDiv.current = document.createElement('div');
                    modalDiv.current.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                    modalDiv.current.innerHTML = `
                        <div class="bg-white p-6 rounded-lg shadow-xl max-w-md text-center">
                            <h3 class="text-xl font-bold text-red-600 mb-4">Exam Auto-Submitted</h3>
                            <p class="mb-4">Your exam has been automatically submitted due to switching tabs 3 times.</p>
                            <p class="text-sm text-gray-500">You will be redirected to the results page in <span id="countdown">10</span> seconds.</p>
                        </div>
                    `;
                    document.body.appendChild(modalDiv.current);
                    
                    // Start countdown
                    let countdown = 10;
                    const countdownElement = document.getElementById('countdown');
                    
                    // Clear any existing interval
                    if (countdownInterval.current) {
                        clearInterval(countdownInterval.current);
                    }
                    
                    countdownInterval.current = setInterval(() => {
                        countdown--;
                        if (countdownElement) {
                            countdownElement.textContent = countdown;
                        }
                        
                        if (countdown <= 0) {
                            clearInterval(countdownInterval.current);
                            // Force a re-render to ensure navigation happens
                            setTimeout(() => {
                                handleAutoSubmit();
                            }, 100);
                        }
                    }, 1000);
                }
                
                return newCount;
            });
        }
    };
    
    // Function to handle auto-submission
    const handleAutoSubmit = async () => {
        try {
            
            if (countdownInterval.current) {
                clearInterval(countdownInterval.current);
            }
            
            // Remove the modal if it exists
            if (modalDiv.current && modalDiv.current.parentNode) {
                modalDiv.current.parentNode.removeChild(modalDiv.current);
            }
            
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/exams/submit`, 
                { 
                    examId: id, 
                    answers,
                    autoSubmitted: true,
                    tabSwitches: 3, 
                    duration: Math.floor((Date.now() - examStartTime.current) / 1000) 
                }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            toast.info("Your exam has been submitted automatically due to multiple tab switches.", {
                position: "top-center",
                autoClose: 3000,
            });
            
            // Force navigation to results page
            window.location.href = '/results';
        } catch (error) {
            console.error('Error auto-submitting exam:', error);
            toast.error("Failed to submit exam automatically. Please try again.");
        }
    };
    
    // Function to handle copy-paste prevention
    const preventCopyPaste = (e) => {
        e.preventDefault();
        showToast('copyPaste', "Copy-paste is not allowed during the exam!");
        return false;
    };
    
    // Function to handle right-click prevention
    const preventRightClick = (e) => {
        e.preventDefault();
        showToast('rightClick', "Right-click is not allowed during the exam!");
        return false;
    };
    
    // Function to handle keyboard shortcuts
    const preventKeyboardShortcuts = (e) => {
       
        if (isAutoSubmitting.current) return;
        
       
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) {
            e.preventDefault();
            showToast('keyboardShortcut', "Keyboard shortcuts are not allowed during the exam!");
        }
    };
    
    useEffect(() => {
        // Add event listeners for anti-cheating measures
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('copy', preventCopyPaste);
        document.addEventListener('paste', preventCopyPaste);
        document.addEventListener('cut', preventCopyPaste);
        document.addEventListener('contextmenu', preventRightClick);
        document.addEventListener('keydown', preventKeyboardShortcuts);
        

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('copy', preventCopyPaste);
            document.removeEventListener('paste', preventCopyPaste);
            document.removeEventListener('cut', preventCopyPaste);
            document.removeEventListener('contextmenu', preventRightClick);
            document.removeEventListener('keydown', preventKeyboardShortcuts);
            

            if (countdownInterval.current) {
                clearInterval(countdownInterval.current);
            }
            
           
            if (modalDiv.current && modalDiv.current.parentNode) {
                modalDiv.current.parentNode.removeChild(modalDiv.current);
            }
            
            
            Object.values(toastIds.current).forEach(id => {
                if (id) toast.dismiss(id);
            });
        };
    }, []);
    
    useEffect(() => {
        const fetchExam = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/exams/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                
                setExam(response.data);
                setAnswers(Array(response.data.questions.length).fill(''));
                setError(null);
            } catch (error) {
                console.error('Error fetching exam:', error);
                
                
                if (error.response && error.response.status === 403) {
                    setError(error.response.data.message);
                    setTimeout(() => {
                        navigate('/results');
                    }, 3000);
                } else {
                    setError('Failed to load exam. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchExam();
    }, [id, navigate]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/exams/submit`, 
                { 
                    examId: id, 
                    answers,
                    duration: Math.floor((Date.now() - examStartTime.current) / 1000) // Duration in seconds
                }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            toast.success('Exam submitted successfully!', {
                position: "top-center",
                autoClose: 2000,
            });
            
            navigate('/results');
        } catch (error) {
            console.error('Error submitting exam:', error);
            
            if (error.response && error.response.data) {
                toast.error(error.response.data.message || 'Failed to submit exam', {
                    position: "top-center",
                    autoClose: 3000,
                });
            } else {
                toast.error('Network error. Please try again.', {
                    position: "top-center",
                    autoClose: 3000,
                });
            }
        }
    };
    
    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading exam...</p>
                <ToastContainer />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
                <p>{error}</p>
                <p className="mt-2">Redirecting to your results page...</p>
                <ToastContainer />
            </div>
        );
    }
    
    return (
        <div className='min-h-[55vh]'>
            <ToastContainer limit={1} />
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                <p className="font-bold">Exam Security Notice:</p>
                <p>Copy-paste, right-click, and tab switching are disabled. You have {3 - tabSwitches} tab switches remaining.</p>
            </div>
            
            {exam && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
                    <h2 className="text-xl font-bold mb-4">{exam.title}</h2>
                    {exam.questions.map((question, index) => (
                        <div key={index} className="mb-4 p-4 border border-gray-200 rounded">
                            <p className="font-semibold">{question.question}</p>
                            {question.options.map((option, optionIndex) => (
                                <label key={optionIndex} className="block mt-2 ml-2">
                                    <input
                                        type="radio"
                                        name={`question-${index}`}
                                        value={option}
                                        checked={answers[index] === option}
                                        onChange={() => {
                                            const newAnswers = [...answers];
                                            newAnswers[index] = option;
                                            setAnswers(newAnswers);
                                        }}
                                        className="mr-2"
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    ))}
                    {role==='student'?
                    <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition"
                    >
                        Submit Exam
                    </button>
                    :
                    <button className='bg-red-500 text-white p-2 rounded transition' disabled>Author can't Attempt</button>
                    }
                </form>
            )}
        </div>
    );
};

export default Exam;