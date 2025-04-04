"use client";

import CountCard from '@/components/count';
import RiskChart from '@/components/riskChart';
import { useCallback, useEffect, useState, useMemo  } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import axios from 'axios';
import CONFIG from '@/config/config';
import { useGlobalContext } from '@/providers/GlobalContext';
import { Data } from '@/models/data';
import { Cluster } from '@/models/cluster';
import AnswerSummaryCard from '@/components/answerSummary';
import ClassificationSummary from '@/components/classificationSummary';
import StudentSummary from '@/components/studentSummary';


export default function HomePage() {
    const { user, data, setData } = useGlobalContext();
    const [clusters, setClusters] = useState<Cluster[]>([]);

    const [form, setForm] = useState({
        userId: user.username,
        datasetName: "",
        kindOfData: "ASSI-A",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSetCluster = (data: Data) => {
        const clusterCount = data.data_summary.cluster_summary.cluster_count;
        const clusters = Object.entries(clusterCount).map(([name, count]) => ({
            name,
            count: count as number,
            color: Math.floor(Math.random() * 16777215).toString(16),
        }));
        setClusters(clusters);
    }

    useEffect(() => {
        if (data) {
            handleSetCluster(data);
        }
    }, [data]);

    return (
        <div className="flex flex-row w-full overflow-y-scroll p-4 text-gray-700">
            <div className="flex-1">
                <div className="flex flex-col justify-between items-start mb-6">
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <p>Welcome to the dashboard</p>
                </div>
                {!data && (
                    <div className="mb-6 p-4">
                        <h2 className="text-lg font-semibold mb-4 " >Dataset Information</h2>
                        {/* add user id to form */}

                        <input
                            type="text"
                            name="datasetName"
                            value={form.datasetName}
                            onChange={handleChange}
                            placeholder="Dataset Name"
                            className="w-full p-2 border rounded mb-3 "
                        />
                        <select
                            name="kindOfData"
                            value={form.kindOfData}
                            onChange={handleChange}
                            className="w-full p-2 border rounded mb-3"
                        >
                            <option value="ASSI-A">Annual Student Screening and Interview (ASSI-A)</option>
                            <option value="ASSI-C">Annual Student Screening and Interview (ASSI-C)</option>
                        </select>
                        <FileUpload setData={setData} form={form} />
                    </div>
                )}
                {data && (
                    <div className='flex flex-col gap-4'>
                        <div className="flex flex-row gap-4 w-full">
                            {/* upload new data button, sets the data to null */}
                            <button onClick={() => setData(null)} className="flex flex-row items-center gap-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300 ease-in-out w-fit">Upload New</button>
                            {/* reset colors button */}
                            <button onClick={() =>  handleSetCluster(data)} className="flex flex-row items-center gap-2 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-300 ease-in-out w-fit">Change Colors</button>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-600">Clusters</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {clusters.map((cluster) => (
                                <CountCard key={cluster.name} title={cluster.name} count={cluster.count} color={cluster.color} />
                            ))}
                        </div>
                        <div className="flex flex-col md:flex-row justify-starts items-center gap-4 h-fit">
                            <RiskChart clusters={clusters} />
                            <AnswerSummaryCard data={data.data_summary.answers_summary} uuid={data.id} type={data.type} clusters={clusters}/>
                        </div>
                        <StudentSummary uuid={data.id} form_type={data.type} number_of_clusters={clusters.length} />
                        {data.data_summary.classification_summary && (
                            <ClassificationSummary 
                                modelData={data.data_summary.classification_summary} 
                                modelName={data.type === "ASSI-A" ? "ASSI-A Model (" + data.data_summary.classification_summary.model_name + ")" : "ASSI-C Model (" + data.data_summary.classification_summary.model_name + ")"} 
                            />
                        )}
                        
                    </div>
                )}
            </div>
        </div>
    );
}

type FileUploadProps = {
    setData: (data: any) => void;
    form: any;
};

const FileUpload = ({ setData, form }: FileUploadProps) => {
    const [isLoading, setIsLoading] = useState(false);
    
    const onDrop = useCallback((acceptedFiles: File[]) => {
        acceptedFiles.forEach((file) => {
            if (form.datasetName === "") {
                alert("Please enter a dataset name");
                return;
            }
            // Check if user ID is missing, redirect to login if it is
            if (!form.userId || form.userId.trim() === "") {
                alert("User ID is required. Please log in first.");
                window.location.href = "/login";
                return;
            }
            
            setIsLoading(true);
            
            const formData = new FormData();
            formData.append('user', form.userId);
            formData.append('file', file);
            formData.append('datasetName', form.datasetName);
            formData.append('kindOfData', form.kindOfData);

            console.log('Uploading to:', CONFIG.API_BASE_URL + '/api/data');
            console.log('Form data:', {
                user: form.userId,
                datasetName: form.datasetName,
                kindOfData: form.kindOfData,
                fileName: file.name
            });

            axios.post(CONFIG.API_BASE_URL + '/api/data', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
                .then(response => {
                    setIsLoading(false);
                    if (response.data && response.data.data) {
                        console.log('Success:', response.data.data);
                        setData(response.data.data);
                    } else {
                        console.error("Invalid response format:", response.data);
                        alert("Error: Invalid response from server");
                    }
                })
                .catch(error => {
                    setIsLoading(false);
                    console.error("Request error:", error);
                    if (error.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        console.error("Server error:", error.response.data);
                        alert(`Error: ${error.response.data.message || 'Server error occurred'}`);
                    } else if (error.request) {
                        // The request was made but no response was received
                        console.error("No response received:", error.request);
                        alert("Error: No response from server. Please check if the server is running.");
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        console.error("Request setup error:", error.message);
                        alert("Error: Failed to send request. Please try again.");
                    }
                });
        });
    }, [form, setData]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "text/csv": [".csv"] },
        multiple: false,
    });

    return (
        <div
            {...getRootProps()}
            className={` rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-all mx-10 md:mx-20 lg:mx-36 ${
                isDragActive ? "bg-purple-400" : "bg-purple-500"
            }`}
        >
            {isLoading ? (
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
                    <p className="text-white">Processing your data...</p>
                </div>
            ) : (
                <>
                    <UploadCloud size={50} className="text-white mb-4" />
                    <input {...getInputProps()} />
                    <button className="bg-white text-purple-700 font-bold py-2 px-4 rounded-lg shadow">
                        CHOOSE FILES
                    </button>
                    <p className="text-white mt-2">or drop files here</p>
                </>
            )}
        </div>
    );
};
