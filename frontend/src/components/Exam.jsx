import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../utils/api';
import { Clock, AlertTriangle, Maximize2 } from 'lucide-react';

const Exam = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true);
    const role = localStorage.getItem('role');
    const [tabSwitches, setTabSwitches] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0); // Time left in seconds
    const [showWarning, setShowWarning] = useState(false);
    const examStartTime = useRef(Date.now());
    const toastIds = useRef({
        copyPaste: null,
        rightClick: null,
        tabSwitch: null,
        keyboardShortcut: null,
        timeWarning: null
    });
    const isAutoSubmitting = useRef(false);
    const countdownInterval = useRef(null);
    const timerInterval = useRef(null);
    const modalDiv = useRef(null);
    
    // Function to format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Function to check if browser is in fullscreen
    const checkFullscreen = () => {
        return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    };

    // Function to request fullscreen
    const requestFullscreen = async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                await document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                await document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.msRequestFullscreen) {
                await document.documentElement.msRequestFullscreen();
            }
            
            console.log('Fullscreen entered successfully');
            setIsFullscreen(true);
            setShowFullscreenPrompt(false);
            
            // Wait a bit for state to update, then start timer
            setTimeout(() => {
                console.log('Starting timer after fullscreen...');
                startTimer();
            }, 100);
            
        } catch (error) {
            console.error('Error requesting fullscreen:', error);
            toast.error('Failed to enter fullscreen mode. Please try again.');
        }
    };

    // Function to exit fullscreen
    const exitFullscreen = () => {
        try {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } catch (error) {
            console.error('Error exiting fullscreen:', error);
        }
    };

    // Function to start the timer
    const startTimer = () => {
        // Prevent multiple timer starts
        if (timerInterval.current) {
            console.log('Timer already running, clearing existing timer');
            clearInterval(timerInterval.current);
            timerInterval.current = null;
        }
        
        console.log('Starting timer with interval of 1000ms');
        console.log('Current timeLeft:', timeLeft);
        
        // Start countdown timer with precise timing
        timerInterval.current = setInterval(() => {
            setTimeLeft(prev => {
                const newTime = prev - 1;
                console.log(`Timer tick: ${prev} -> ${newTime}`);
                
                if (newTime <= 0) {
                    console.log('Time up! Clearing timer and calling handleTimeUp');
                    if (timerInterval.current) {
                        clearInterval(timerInterval.current);
                        timerInterval.current = null;
                    }
                    handleTimeUp();
                    return 0;
                }
                
                return newTime;
            });
        }, 1000);
        
        console.log('Timer started successfully');
    };

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

    // Function to handle time warning at 30 seconds
    const handleTimeWarning = () => {
        // Only show warning when exactly 30 seconds are remaining
        if (timeLeft === 30 && !showWarning) {
            setShowWarning(true);
            toast.warning("⚠️ Only 30 seconds remaining! Submit your exam soon!", {
                position: "top-center",
                autoClose: 5000,
                icon: <AlertTriangle className="text-yellow-500" />
            });
        }
        
        // Reset warning if time somehow goes above 30 seconds again
        if (timeLeft > 30 && showWarning) {
            setShowWarning(false);
        }
    };

    // Function to handle auto-submission when time runs out
    const handleTimeUp = async () => {
        if (isAutoSubmitting.current) return;
        
        isAutoSubmitting.current = true;
        
        try {
            // Clear timer interval
            if (timerInterval.current) {
                clearInterval(timerInterval.current);
            }
            
            // Show modal
            modalDiv.current = document.createElement('div');
            modalDiv.current.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modalDiv.current.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-xl max-w-md text-center">
                    <h3 class="text-xl font-bold text-red-600 mb-4">Time's Up!</h3>
                    <p class="mb-4">Your exam has been automatically submitted due to time expiration.</p>
                    <p class="text-sm text-gray-500">You will be redirected to the results page in <span id="countdown">5</span> seconds.</p>
                </div>
            `;
            document.body.appendChild(modalDiv.current);
            
            // Start countdown
            let countdown = 5;
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
                            // Exit fullscreen before auto-submitting
                            if (isFullscreen) {
                                exitFullscreen();
                            }
                            setTimeout(() => {
                                submitExam(true);
                            }, 100);
                        }
            }, 1000);
            
        } catch (error) {
            console.error('Error handling time up:', error);
            submitExam(true);
        }
    };

    // Function to submit exam (either manual or auto)
    const submitExam = async (isAutoSubmit = false) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/exams/submit`, 
                { 
                    examId: id, 
                    answers,
                    autoSubmitted: isAutoSubmit,
                    tabSwitches: tabSwitches, 
                    duration: Math.floor((Date.now() - examStartTime.current) / 1000) 
                }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Exit fullscreen mode after exam submission
            if (isFullscreen) {
                toast.info("Exiting fullscreen mode...", {
                    position: "top-center",
                    autoClose: 2000,
                });
                exitFullscreen();
            }
            
            if (isAutoSubmit) {
                toast.info("Your exam has been submitted automatically due to time expiration.", {
                    position: "top-center",
                    autoClose: 3000,
                });
            } else {
                toast.success('Exam submitted successfully!', {
                    position: "top-center",
                    autoClose: 2000,
                });
            }
            
            // Navigate to results page
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
                            // Exit fullscreen before auto-submitting
                            if (isFullscreen) {
                                exitFullscreen();
                            }
                            // Force a re-render to ensure navigation happens
                            setTimeout(() => {
                                submitExam(true);
                            }, 100);
                        }
                    }, 1000);
                }
                
                return newCount;
            });
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

    // Function to handle fullscreen change
    const handleFullscreenChange = () => {
        const fullscreen = checkFullscreen();
        setIsFullscreen(fullscreen);
        
        if (!fullscreen && !showFullscreenPrompt) {
            // User exited fullscreen during exam
            toast.error("⚠️ You must stay in fullscreen mode to continue the exam!");
            setShowFullscreenPrompt(true);
            // Stop timer if it's running
            if (timerInterval.current) {
                clearInterval(timerInterval.current);
                timerInterval.current = null;
            }
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
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('copy', preventCopyPaste);
            document.removeEventListener('paste', preventCopyPaste);
            document.removeEventListener('cut', preventCopyPaste);
            document.removeEventListener('contextmenu', preventRightClick);
            document.removeEventListener('keydown', preventKeyboardShortcuts);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
            
            // Clear intervals
            if (countdownInterval.current) {
                clearInterval(countdownInterval.current);
            }
            
            if (timerInterval.current) {
                clearInterval(timerInterval.current);
            }
            
            // Remove modal
            if (modalDiv.current && modalDiv.current.parentNode) {
                modalDiv.current.parentNode.removeChild(modalDiv.current);
            }
            
            // Dismiss toasts
            Object.values(toastIds.current).forEach(id => {
                if (id) toast.dismiss(id);
            });
            
            // Exit fullscreen when component unmounts
            if (isFullscreen) {
                exitFullscreen();
            }
        };
    }, [isFullscreen]);
    
    useEffect(() => {
        const fetchExam = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/exams/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                
                setExam(response.data);
                setAnswers(Array(response.data.questions.length).fill(''));
                
                // Initialize timer but don't start it yet - timer will start only after fullscreen is enabled
                const timeLimitInSeconds = response.data.timeLimit * 60;
                setTimeLeft(timeLimitInSeconds);
                console.log(`Timer initialized with ${timeLimitInSeconds} seconds, waiting for fullscreen`);
                
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

    // Effect to handle time warning
    useEffect(() => {
        if (isFullscreen && timeLeft > 0) { // Only handle warnings when in fullscreen and timer is running
            handleTimeWarning();
        }
        
        // Stop timer if fullscreen is exited
        if (!isFullscreen && timerInterval.current) {
            console.log('Fullscreen exited, stopping timer');
            clearInterval(timerInterval.current);
            timerInterval.current = null;
        }
        
        // Debug: Log timer state
        console.log('Timer state:', { isFullscreen, timeLeft, hasTimer: !!timerInterval.current });
    }, [timeLeft, isFullscreen]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        await submitExam(false);
    };

    // Fullscreen prompt component
    if (showFullscreenPrompt && role === 'student') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                    <div className="mb-6">
                        <Maximize2 size={64} className="mx-auto text-blue-600 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Fullscreen Required</h2>
                        <p className="text-gray-600">
                            This exam can only be attempted in fullscreen mode to ensure exam integrity.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <button
                            onClick={requestFullscreen}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                        >
                            Enter Fullscreen Mode
                        </button>
                        
                        <p className="text-sm text-gray-500">
                            Click the button above to enter fullscreen mode and begin your exam.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    
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
            
            {/* Timer Display */}
            <div className={`mb-4 p-4 rounded-lg border-l-4 ${
                timeLeft <= 30 
                    ? 'bg-red-100 border-red-500 text-red-700' 
                    : 'bg-blue-100 border-blue-500 text-blue-700'
            }`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-bold">Time Remaining:</p>
                        <p className="text-sm">Complete your exam before time runs out</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Timer: {timerInterval.current ? 'Running' : 'Stopped'} | 
                            Fullscreen: {isFullscreen ? 'Yes' : 'No'}
                        </p>
                    </div>
                    <div className={`text-2xl font-bold font-mono ${
                        timeLeft <= 30 ? 'text-red-600' : 'text-blue-600'
                    }`}>
                        <Clock size={24} className="inline mr-2" />
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>
            
            {/* 30 Second Warning */}
            {showWarning && timeLeft <= 30 && (
                <div 
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 animate-pulse shadow-lg"
                >
                    <div className="flex items-center">
                        <AlertTriangle size={20} className="mr-2 animate-bounce" />
                        <p className="font-bold">⚠️ Critical Time Warning:</p>
                    </div>
                    <p className="ml-6">
                        {timeLeft === 30 
                            ? "Only 30 seconds remaining! Submit your exam immediately!"
                            : `Only ${timeLeft} seconds remaining! Submit your exam now!`
                        }
                    </p>
                </div>
            )}
            
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                <p className="font-bold">Exam Security Notice:</p>
                <p>Copy-paste, right-click, and tab switching are disabled. You have {3 - tabSwitches} tab switches remaining.</p>
                {isFullscreen && (
                    <div>
                        <p className="mt-2 text-sm">✅ Fullscreen mode is active</p>
                        {!timerInterval.current && timeLeft > 0 && (
                            <button 
                                onClick={startTimer}
                                className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                                Start Timer
                            </button>
                        )}
                    </div>
                )}
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