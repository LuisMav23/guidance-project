"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

import CONFIG from '@/config/config';

interface StudentSummaryProps {
    uuid: string;
    form_type: string;
    number_of_clusters?: number;
}

interface Student {
    Name: string;
    Grade: string;
    Gender: string;
    Cluster: number;
    Questions: Record<string, string>;
}

const StudentSummary = ({ uuid, form_type, number_of_clusters = 2 }: StudentSummaryProps) => {
    const [search, setSearch] = useState('');
    const [student, setStudent] = useState<Student | null>(null);
    const [questions, setQuestions] = useState<Array<{question: string, answer: string}>>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [selectedCluster, setSelectedCluster] = useState<number>(0);

    const handleSearchSubmit = () => {
        axios.get(`${CONFIG.API_BASE_URL}/api/student/data/${uuid}/${form_type}/${search}`, {})
            .then((res) => {
                setStudent(res.data);
                setSelectedCluster(res.data.Cluster);
                // Reset questions array before populating
                setQuestions([]);
                Object.keys(res.data.Questions).forEach((question) => {
                    setQuestions((prev) => [...prev, { question: question, answer: res.data.Questions[question] }]);
                });
            })
            .catch((err) => {
                console.log(err);
            })
    }

    const handleClusterChange = (cluster: number) => {
        if (!student) return;
        axios.put(`${CONFIG.API_BASE_URL}/api/student/data/${uuid}/${form_type}/${student.Name}/${cluster}`, {})
            .then((res) => {
                alert("Cluster updated successfully");
                setStudent({...student, Cluster: cluster});
            })
            .catch((err) => {
                console.log(err);
            })
    }

  return (
    <div className="w-full flex flex-col justify-start items-start p-4 shadow-lg rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-row justify-between items-center w-full">
            <h1 className="text-2xl font-bold">Student Summary</h1>
        </div>
        <div className="flex flex-col justify-between items-center w-full">
            <div className="relative w-full mt-4 flex flex-row items-center gap-2">
                <p className="text-lg font-medium">
                    Search:
                </p>
                <input
                    type="text"
                    placeholder="Search students..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={handleSearchSubmit}
                >
                    <svg
                        className="w-5 h-5 text-blue-500 hover:text-blue-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                    </svg>
                </button>
            </div>
            {student && (
                <div className="flex flex-col md:flex-row w-full justify-start items-start gap-6 mt-6 p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex flex-col justify-start items-start w-full md:w-4/12 bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Student Information</h2>
                        <div className="space-y-3 w-full">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-600">Name:</span>
                                <span className="text-gray-800">{student.Name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-600">Grade:</span>
                                <span className="text-gray-800">{student.Grade}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-600">Gender:</span>
                                <span className="text-gray-800">{student.Gender}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-600">Cluster:</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{student.Cluster}</span>
                            </div>
                            <div className="flex flex-col gap-2 mt-2">
                                <span className="font-medium text-gray-600">Change Cluster:</span>
                                <div className="flex items-center gap-2">
                                    <select 
                                        value={selectedCluster}
                                        onChange={(e) => setSelectedCluster(Number(e.target.value))}
                                        className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {Array.from({ length: number_of_clusters }, (_, i) => i).map((cluster) => (
                                            <option key={cluster} value={cluster}>
                                                Cluster {cluster}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => handleClusterChange(selectedCluster)}
                                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-8/12 mt-4 md:mt-0">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Student Responses</h2>
                        <div className="flex flex-row justify-between items-center w-full mb-4">
                            <button 
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                                className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1 ${currentQuestionIndex === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>
                            <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </span>
                            <button 
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                disabled={currentQuestionIndex === questions.length - 1}
                                className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1 ${currentQuestionIndex === questions.length - 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                            >
                                Next
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        <div className="border rounded-lg p-6 bg-gray-50 shadow-sm">
                            {questions.length > 0 ? (
                                <div>
                                    <p className="font-semibold mb-3 text-gray-800 text-lg">
                                        {questions[currentQuestionIndex].question}
                                    </p>
                                    <p className="text-gray-700 bg-white p-4 rounded-lg border border-gray-100">
                                        {questions[currentQuestionIndex].answer}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                    </svg>
                                    <p className="text-gray-500 italic">No responses available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default StudentSummary;
