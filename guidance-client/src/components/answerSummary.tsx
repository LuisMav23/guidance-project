"use client";

import { useEffect, useState, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

import { Cluster } from "@/models/cluster";
import CONFIG from "@/config/config";
import axios from "axios";

interface AnswerSummaryChartProps {
  data: Record<string, any>;
  uuid: string;
  type: string;
  clusters: Cluster[];
}

const AnswerSummaryChart = ({
  data,
  uuid,
  type,
  clusters,
}: AnswerSummaryChartProps) => {
  const [currentCluster, setCurrentCluster] = useState("all");
  const [currentClusterIndex, setCurrentClusterIndex] = useState(0);
  const [currentGender, setCurrentGender] = useState("all");
  const [currentGrade, setCurrentGrade] = useState("all");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentPercentage, setCurrentPercentage] = useState<Record<string, any>>(
    {}
  );
  const [currentData, setCurrentData] = useState<Record<string, any>>(data);

  const reloadData = useCallback(() => {
    const entries = Object.entries(currentData);
    setCurrentQuestionIndex(currentQuestionIndex)
    const entry = entries[currentQuestionIndex];
    if (entry) {
      const [question, counts] = entry;
      setCurrentQuestion(question);
      const values = Object.values(counts) as number[];
      const total = values.reduce((acc, val) => acc + val, 0);
      const percentages = Object.fromEntries(
        Object.entries(counts).map(([key, value]) => [
          key,
          total ? (Number(value) / total) * 100 : 0,
        ])
      );
      setCurrentPercentage(percentages);
    } else {
      setCurrentQuestion("");
      setCurrentPercentage({});
    }
  }, [currentData, currentQuestionIndex]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const handleSubmitFilter = async () => {
    try {
      const response = await axios.get(
        `${CONFIG.API_BASE_URL}/api/answer_summary?uuid=${uuid}&form_type=${type}&cluster=${currentCluster}&grade=${currentGrade}&gender=${currentGender}`
      );
      setCurrentData(response.data);
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const chartData = {
    labels: Object.keys(currentPercentage),
    datasets: [
      {
        label: "Percentage",
        data: Object.values(currentPercentage),
        backgroundColor:
          currentCluster === "all"
            ? "#2A7FFE"
            : clusters && clusters[currentClusterIndex]
            ? `#${clusters[currentClusterIndex].color}`
            : "#2A7FFE",
        borderColor:
          currentCluster === "all"
            ? "rgba(75, 192, 192, 1)"
            : clusters && clusters[currentClusterIndex]
            ? `#${clusters[currentClusterIndex].color}`
            : "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="p-4 rounded-lg shadow-lg w-full max-w-md bg-white h-full">
      <div className="flex flex-col justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Answer Summary</h2>
        <div className="flex flex-wrap gap-2">
          <select
            className="border p-2 rounded-md"
            value={currentCluster}
            onChange={(e) => {
              const value = e.target.value;
              setCurrentCluster(value);
              setCurrentClusterIndex(value === "all" ? 0 : Number(value));
              handleSubmitFilter();
            }}
          >
            <option value="all">All Clusters</option>
            {clusters.map((cluster, index) => (
              <option key={index} value={index}>
                {index + 1} - {cluster.name}
              </option>
            ))}
          </select>
          <select
            className="border p-2 rounded-md"
            value={currentGrade}
            onChange={(e) => {
              setCurrentGrade(e.target.value);
              handleSubmitFilter();
            }}
          >
            <option value="all">All Grades</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i + 1}>
                Grade {i + 1}
              </option>
            ))}
          </select>
          <select
            className="border p-2 rounded-md"
            value={currentGender}
            onChange={(e) => {
              setCurrentGender(e.target.value);
              handleSubmitFilter();
            }}
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>
      <div className="h-60 w-full flex flex-col justify-between items-center">
        <p>{currentQuestion}</p>
        <div className="h-48 w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <button
          disabled={currentQuestionIndex === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={() => {
            if (currentQuestionIndex > 0) {
              setCurrentQuestionIndex((prev) => prev - 1);
            }
          }}
        >
          Previous
        </button>
        <button
          disabled={
            currentQuestionIndex === Object.entries(currentData).length - 1
          }
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={() => {
            const maxIndex = Object.entries(currentData).length - 1;
            if (currentQuestionIndex < maxIndex) {
              setCurrentQuestionIndex((prev) => prev + 1);
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
