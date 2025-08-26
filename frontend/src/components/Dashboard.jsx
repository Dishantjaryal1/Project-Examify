/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Award, Clock } from 'lucide-react';
import { API_URL } from '../utils/api';

const Dashboard = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const role = localStorage.getItem('role');
    
    useEffect(() => {
        const fetchExams = async () => {
            const token = localStorage.getItem('token');
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/exams`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setExams(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching exams', error);
                setError('Failed to load exams. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchExams();
    }, []);
    
    const getMessageForEmptyExams = () => {
        if (role === 'examiner') {
            return "You haven't created any exams yet.";
        } else {
            return "You've completed all available exams! Check your results page to see how you did.";
        }
    };
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto min-h-screen p-6">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center mb-8"
            >
                <h1 className="text-2xl font-bold text-indigo-800 flex items-center">
                    <BookOpen size={28} className="mr-2 text-indigo-600" />
                    {role === 'examiner' ? 'Your Created Exams' : 'Available Exams'}
                </h1>
                
                {role === 'examiner' && (
                    <Link to="/create-exam">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition flex items-center"
                        >
                            <Plus size={18} className="mr-1" />
                            Create New Exam
                        </motion.button>
                    </Link>
                )}
            </motion.div>
            
            {loading ? (
                <div className="flex justify-center p-8">
                    <motion.div
                        animate={{ 
                            rotate: 360,
                        }}
                        transition={{ 
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
                    />
                </div>
            ) : error ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm"
                >
                    <p>{error}</p>
                </motion.div>
            ) : exams.length > 0 ? (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {exams.map((exam) => (
                        <motion.div 
                            key={exam._id} 
                            variants={itemVariants}
                            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.1)' }}
                            className="border border-indigo-100 p-6 rounded-xl bg-white shadow hover:shadow-lg transition-all"
                        >
                            <h2 className="font-semibold text-xl mb-3 text-indigo-800">{exam.title}</h2>
                            <div className="flex items-center mb-4 text-indigo-600">
                                <BookOpen size={16} className="mr-2" />
                                <p className="text-gray-600">{exam.questions.length} Questions</p>
                            </div>
                            
                            <div className="flex items-center mb-4 text-indigo-600">
                                <Clock size={16} className="mr-2" />
                                <p className="text-gray-600">{exam.timeLimit} minutes</p>
                            </div>
                            
                            <Link to={`/exam/${exam._id}`}>
                                <motion.button 
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white p-3 rounded-lg shadow transition flex items-center justify-center"
                                >
                                    {role === 'examiner' ? 'View Exam' : 'Take Exam'}
                                </motion.button>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-12 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm"
                >
                    <Award size={48} className="mx-auto mb-4 text-indigo-300" />
                    <p className="text-indigo-800 mb-6 text-lg">{getMessageForEmptyExams()}</p>
                    
                    {role === 'examiner' ? (
                        <Link to="/create-exam">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg shadow transition"
                            >
                                Create Your First Exam
                            </motion.button>
                        </Link>
                    ) : (
                        <Link to="/results">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg shadow transition"
                            >
                                View Your Results
                            </motion.button>
                        </Link>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default Dashboard;