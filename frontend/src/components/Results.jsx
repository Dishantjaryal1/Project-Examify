/* eslint-disable no-unused-vars */
// src/components/Results.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Download, Award, CheckCircle, XCircle, FileText } from 'lucide-react';
import { API_URL } from '../utils/api';

const Results = () => {
    const [results, setResults] = useState([]);
    const [exams, setExams] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                // Fetch results
                const resultsResponse = await axios.get(`${API_URL}/results`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Filter out results with null exam data
                const validResults = resultsResponse.data.filter(result => result && result.exam);
                
                if (validResults.length !== resultsResponse.data.length) {
                    console.warn('Some results had missing exam data and were filtered out');
                }
                
                setResults(validResults);
                setLoading(false);
            } catch (err) {
                setError('Failed to load your results. Please try again later.');
                setLoading(false);
                console.error('Error fetching results:', err);
            }
        };
        
        fetchData();
    }, []);

    const calculatePercentage = (result) => {
        // Add null check for result.exam
        if (!result || !result.exam || !result.exam.questions) {
            return 0;
        }
        
        const totalQuestions = result.exam.questions.length;
        if (totalQuestions === 0) return 0;
        
        return Math.round((result.score / totalQuestions) * 100);
    };

    const getExamTitle = (result) => {
        // Add null check for result.exam
        if (!result || !result.exam) {
            return "Unknown Exam";
        }
        return result.exam.title || "Untitled Exam";
    };

    const getQuestionCount = (result) => {
        // Add null check for result.exam
        if (!result || !result.exam || !result.exam.questions) {
            return 0;
        }
        return result.exam.questions.length;
    };

    const downloadCertificate = (resultId) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios({
            url: `${API_URL}/results/certificate/${resultId}`,
            method: 'GET',
            responseType: 'blob',
            headers: { Authorization: `Bearer ${token}` }
        }).then((response) => {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `certificate-${resultId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setLoading(false);
        }).catch((error) => {
            setLoading(false);
            setError('Error downloading certificate. Please try again later.');
            console.error('Error downloading certificate:', error);
        });
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading && results.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your results...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <XCircle size={48} className="mx-auto" />
                    </div>
                    <p className="text-gray-600">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                        <div className="flex items-center">
                            <Award className="text-white mr-3" size={24} />
                            <h1 className="text-2xl font-bold text-white">Your Exam Results</h1>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-600 mb-6">
                            View your performance across all exams. Download certificates for the exams you've passed.
                        </p>
                        
                        {results.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="mx-auto text-gray-400 mb-3" size={48} />
                                <p className="text-gray-500">You haven't taken any exams yet.</p>
                                <button 
                                    onClick={() => window.location.href = '/exams'} 
                                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                >
                                    Browse Available Exams
                                </button>
                            </div>
                        ) : (
                            <motion.div 
                                className="space-y-4"
                                variants={container}
                                initial="hidden"
                                animate="show"
                            >
                                {results.map(result => {
                                    const percentage = calculatePercentage(result);
                                    const totalQuestions = getQuestionCount(result);
                                    
                                    return (
                                        <motion.div 
                                            key={result._id} 
                                            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                            variants={item}
                                        >
                                            <div className={`flex justify-between items-center p-5 ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                                                <div className="flex items-center">
                                                    {result.passed ? 
                                                        <CheckCircle className="text-green-500 mr-3" size={20} /> : 
                                                        <XCircle className="text-red-500 mr-3" size={20} />
                                                    }
                                                    <div>
                                                        <h3 className="font-semibold text-gray-800">{getExamTitle(result)}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            {result.passed ? 'Passed' : 'Failed'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-2xl font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                        {percentage}%
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Score: {result.score}/{totalQuestions}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="p-4 bg-white border-t border-gray-200">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <div className="text-sm text-gray-500">Completion time: {result.duration ? `${Math.floor(result.duration / 60)}m ${result.duration % 60}s` : 'N/A'}</div>
                                                        <div className="text-sm text-gray-500">Questions: {totalQuestions}</div>
                                                        {result.autoSubmitted && (
                                                            <div className="text-sm text-red-500 mt-1">
                                                                <span className="font-semibold">Auto-submitted</span> due to multiple tab switches ({result.tabSwitches} switches)
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {result.passed && (
                                                        <button 
                                                            onClick={() => downloadCertificate(result._id)} 
                                                            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                                                            disabled={loading}
                                                        >
                                                            <Download size={16} className="mr-2" />
                                                            {loading ? 'Processing...' : 'Download Certificate'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Results;