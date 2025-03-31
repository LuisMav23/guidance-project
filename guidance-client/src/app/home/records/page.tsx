"use client";

import { useEffect } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/providers/GlobalContext";
import axios from "axios";
import CONFIG from "@/config/config";

const RecordsPage: React.FC = () => {
  const { user, records, setRecords, setData } = useGlobalContext();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        if (!user?.username) return;

        const response = await axios.get(`${CONFIG.API_BASE_URL}/api/data`, {
          params: { username: user.username },
        });

        console.log("response:", response.data);

        const records = response.data.records || [];
        setRecords(records);
        
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };

    fetchRecords();
  }, [user?.username]); 

  return (
    <div className="p-4 text-gray-700 w-full flex flex-col justify-start items-start overflow-y-scroll">
      <h1 className="text-2xl font-semibold mb-4">Records</h1>

      {records.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <table className="w-full border-collapse table-auto shadow-lg bg-white">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100">Dataset name</th>
              <th className="border border-gray-300 p-2 bg-gray-100">Owner</th>
              <th className="border border-gray-300 p-2 bg-gray-100">Type</th>
              <th className="border border-gray-300 p-2 bg-gray-100">Created at</th>
              <th className="border border-gray-300 p-2 bg-gray-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <RecordsRow key={record.id} record={record} setData={setData}/>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RecordsPage;

const RecordsRow: React.FC<{ record: any; setData: (data: any) => void }> = ({ record, setData }) => {
  const router = useRouter();

  const handleView = async () => {
    try {
      const response = await axios.get(`${CONFIG.API_BASE_URL}/api/data/${record.type}/${record.uuid}`);
      console.log("response:", response.data);
      setData(response.data);
      router.push('/home');
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${CONFIG.API_BASE_URL}/api/data/${record.uuid}`);
      console.log("response:", response.data);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  return (
    <tr className="border border-gray-300 p-2 hover:bg-gray-100 transition-colors">
      <td className="border border-gray-300 p-2 text-center">{record?.name}</td>
      <td className="border border-gray-300 p-2 text-center">{record?.username}</td>
      <td className="border border-gray-300 p-2 text-center">{record?.type}</td>
      <td className="border border-gray-300 p-2 text-center">{record?.created_at}</td>
      <td className="border border-gray-300 p-2 flex justify-evenly items-center">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleView}>
          View Results
        </button>
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleDelete}>
          Delete
        </button>
      </td>
    </tr>
  );
};