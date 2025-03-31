"use client";

import { useEffect, useState } from "react";
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

import { Cluster } from "@/models/cluster";
import { AnswerSummary } from "@/models/answerSummary";


interface AnswerSummaryChartProps {
  data: AnswerSummary;
  type: string;
  clusters: Cluster[];
}

const assiAQuestions: string[] = ['Gender', 'Because I need at least a high-school degree in order to find a high-paying job later on.', 'Because I experience pleasure and satisfaction while learning new things.', 'Because I think that a high-school education will help me better prepare for the career I have chosen.', 'Because I really like going to school.', "Honestly, I don't know; I really feel that I am wasting my time in school.", 'For the pleasure I experience while surpassing myself in my studies.', 'To prove to myself that I am capable of completing my high-school degree.', 'In order to obtain a more prestigious job later on.', 'For the pleasure I experience when I discover new things never seen before.', 'Because eventually it will enable me to enter the job market in a field that I like.', 'Because for me, school is fun.', 'I once had good reasons for going to school; however, now I wonder whether I should continue.', 'For the pleasure that I experience while I am surpassing myself in one of my personal accomplishments.', 'Because of the fact that when I succeed in school I feel\r\nimportant.', 'Because I want to have "the good life" later on.', 'For the pleasure that I experience in broadening my\r\nknowledge about subjects which appeal to me.', 'Because this will help me make a better choice regarding my career orientation.', 'For the pleasure that I experience when I am taken by\r\ndiscussions with interesting teachers.', "I can't see why I go to school and frankly, I couldn't care\r\nless.", 'For the satisfaction I feel when I am in the process of\r\naccomplishing difficult academic activities.', 'To show myself that I am an intelligent person.', 'In order to have a better salary later on.', 'Because my studies allow me to continue to learn about\r\nmany things that interest me.', 'Because I believe that my high school education will\r\nimprove my competence as a worker.', 'For the "high" feeling that I experience while reading about various interesting subjects.', "I don't know; I can't understand what I am doing in school.", 'Because high school allows me to experience a personal satisfaction in my quest for excellence in my studies.', 'Because I want to show myself that I can succeed in my\r\nstudies.'];
const assiCQuestions: string[] = ['Gender', 'Complain of aches or pains', 'Spend more time alone', 'Tire easily, little energy', 'Fidgety, unable to sit still', 'Have trouble with teacher', 'Less interested in school', 'Act as if driven by motor', 'Daydream too much', 'Distract easily', 'Are afraid of new situations', 'Feel sad, unhappy', 'Are irritable, angry', 'Feel hopeless', 'Have trouble concentrating', 'Less interested in friends', 'Fight with other children', 'Absent from school', 'School grades dropping', 'Down on yourself', 'Visit doctor with doctor finding nothing\r\nwrong', 'Have trouble sleeping', 'Worry a lot', 'Want to be with parent more than before', 'Feel that you are bad', 'Take unnecessary risks', 'Get hurt frequently', 'Seem to be having less fun', 'Act younger than children your age', 'Do not listen to rules', 'Do not show feelings', "Do not understand other people's feelings", 'Tease others', 'Blame others for your troubles', 'Take things that do not belong to you', 'Refuse to share']

const AnswerSummaryChart = ({ data, type, clusters }: AnswerSummaryChartProps) => {
  const [currentCluster, setCurrentCluster] = useState('all');
  const [currentClusterIndex, setCurrentClusterIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentData, setCurrentData] = useState({});

  useEffect(() => {
    const question = type === "ASSI-A" ? assiAQuestions[currentQuestionIndex] : assiCQuestions[currentQuestionIndex];
    const summary =
      currentCluster === "all"
        ? data.full[question]
        : data.per_cluster[currentClusterIndex]?.[question];

    if (summary) {
      const total = (Object.values(summary) as number[]).reduce((acc, val) => acc + val, 0);
      const percentages = Object.fromEntries(
        Object.entries(summary).map(([key, value]) => [
          key,
          total ? (Number(value) / total) * 100 : 0,
        ])
      );
      setCurrentData(percentages);
    } else {
      setCurrentData({});
    }
    console.log("currentData:", currentData);
    console.log("question:", question);
    console.log("summary:", summary);
  }, [currentQuestionIndex, currentCluster, currentClusterIndex, data, type]);

  const handleClusterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCurrentCluster(value);
    
    if (value === "all") {
      const question = type === "ASSI-A" ? assiAQuestions[currentQuestionIndex] : assiCQuestions[currentQuestionIndex];
      setCurrentData(data.full[question] || {});
    } else {
      const clusterIdx = parseInt(value);
      setCurrentClusterIndex(clusterIdx);
      
      const question = type === "ASSI-A" ? assiAQuestions[currentQuestionIndex] : assiCQuestions[currentQuestionIndex];
      const summary = data.per_cluster[clusterIdx]?.[question];
      
      if (summary) {
        const total = (Object.values(summary) as number[]).reduce((acc, val) => acc + val, 0);
        const percentages = Object.fromEntries(
          Object.entries(summary).map(([key, value]) => [
            key,
            total ? (Number(value) / total) * 100 : 0,
          ])
        );
        setCurrentData(percentages);
      } else {
        setCurrentData({});
      }
    }
  }

  const chartData = {
    labels: Object.keys(currentData),
    datasets: [
      {
        label: 'Percentage',
        data: Object.values(currentData),
        backgroundColor: currentCluster === "all" 
          ? '#2A7FFE' 
          : clusters && clusters[currentClusterIndex] 
            ? `#${clusters[currentClusterIndex].color}` 
            : '#2A7FFE',
        borderColor: currentCluster === "all" 
          ? 'rgba(75, 192, 192, 1)' 
          : clusters && clusters[currentClusterIndex] 
            ? `#${clusters[currentClusterIndex].color}` 
            : 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-4 rounded-lg shadow-lg w-full max-w-md bg-white h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Answer Summary</h2>
        <select
          className="border p-2 rounded-md"
          value={currentCluster}
          onChange={handleClusterChange}
        >
          <option value="all">All</option>
          {data.per_cluster && 
            Object.keys(data.per_cluster).map((cluster, index) => (
              <option key={index} value={index.toString()}>
                Cluster {index + 1}
              </option>
            ))
          }
        </select>
      </div>
      <div className="h-60 w-full flex flex-col justify-between items-center">
        <p>{type === "ASSI-A" ? assiAQuestions[currentQuestionIndex] : assiCQuestions[currentQuestionIndex]}</p>
        <div className="h-48 w-full">
          <Bar data={chartData} />
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <button
          disabled={currentQuestionIndex === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={() => {
            if (currentQuestionIndex > 0) {
              const newIndex = currentQuestionIndex - 1;
              setCurrentQuestionIndex(newIndex);
              
              const question = type === "ASSI-A" ? assiAQuestions[newIndex] : assiCQuestions[newIndex];
              if (currentCluster === "all") {
                setCurrentData(data.full[question] || {});
              } else {
                const summary = data.per_cluster[currentClusterIndex]?.[question];
                if (summary) {
                  const total = (Object.values(summary) as number[]).reduce((acc, val) => acc + val, 0);
                  const percentages = Object.fromEntries(
                    Object.entries(summary).map(([key, value]) => [
                      key,
                      total ? (Number(value) / total) * 100 : 0,
                    ])
                  );
                  setCurrentData(percentages);
                } else {
                  setCurrentData({});
                }
              }
            }
          }}
        >
          Previous
        </button>
        <button
          disabled={currentQuestionIndex === (type === "ASSI-A" ? assiAQuestions.length - 1 : assiCQuestions.length - 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={() => {
            const maxIndex = type === "ASSI-A" ? assiAQuestions.length - 1 : assiCQuestions.length - 1;
            if (currentQuestionIndex < maxIndex) {
              const newIndex = currentQuestionIndex + 1;
              setCurrentQuestionIndex(newIndex);
              
              const question = type === "ASSI-A" ? assiAQuestions[newIndex] : assiCQuestions[newIndex];
              if (currentCluster === "all") {
                setCurrentData(data.full[question] || {});
              } else {
                const summary = data.per_cluster[currentClusterIndex]?.[question];
                if (summary) {
                  const total = (Object.values(summary) as number[]).reduce((acc, val) => acc + val, 0);
                  const percentages = Object.fromEntries(
                    Object.entries(summary).map(([key, value]) => [
                      key,
                      total ? (Number(value) / total) * 100 : 0,
                    ])
                  );
                  setCurrentData(percentages);
                } else {
                  setCurrentData({});
                }
              }
            }
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AnswerSummaryChart;
