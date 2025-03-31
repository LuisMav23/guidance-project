import { useState } from 'react';

interface ClassificationReport {
  precision: number;
  recall: number;
  "f1-score": number;
  support?: number;
}

interface ClassificationSummary {
  accuracy: number;
  model_name: string;
  report: Record<string, ClassificationReport>;
  confusion_matrix: number[][];
}

const ClassificationSummary = ({ modelData, modelName }: { modelData: ClassificationSummary, modelName: string }) => {
  const { accuracy, report, confusion_matrix } = modelData;
  const [hoveredCell, setHoveredCell] = useState<{ row: number, col: number } | null>(null);

  // Find the maximum value in the confusion matrix for color scaling
  const maxValue = Math.max(...confusion_matrix.flat());

  // Generate color intensity based on value
  const getColorIntensity = (value: number) => {
    const intensity = Math.floor((value / maxValue) * 255);
    return `rgba(66, 133, 244, ${value / maxValue})`;
  };

  return (
    <div className="w-full p-4 shadow-lg rounded-lg border border-gray-200 bg-white">
      <div className="pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Model: {modelName}</h2>
      </div>
      <div className="pt-4">
        <p className="text-lg font-semibold">Accuracy: {accuracy.toFixed(2)}</p>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Confusion Matrix</h3>
          <div className="flex justify-center">
            <div>
              {confusion_matrix.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => (
                    <div 
                      key={colIndex}
                      className="w-12 h-12 flex items-center justify-center border border-gray-300 relative"
                      style={{ backgroundColor: getColorIntensity(cell) }}
                      onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <span className="text-sm font-medium text-white">{cell}</span>
                      {hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex && (
                        <div className="absolute -top-10 left-0 bg-gray-800 text-white text-xs p-2 rounded z-10">
                          Actual: {rowIndex}, Predicted: {colIndex}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-white border border-gray-300"></div>
              <span className="text-xs ml-1 mr-2">Low</span>
              <div className="w-20 h-4 bg-gradient-to-r from-white to-blue-500 border border-gray-300"></div>
              <span className="text-xs ml-1">High</span>
            </div>
          </div>
        </div>

        <h3 className="mt-6 text-lg font-semibold">Classification Report</h3>
        <div className="overflow-x-auto">
          <table className="w-full mt-2 border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-2 py-1">Class</th>
                <th className="border border-gray-300 px-2 py-1">Precision</th>
                <th className="border border-gray-300 px-2 py-1">Recall</th>
                <th className="border border-gray-300 px-2 py-1">F1-Score</th>
                <th className="border border-gray-300 px-2 py-1">Support</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(report).map(([key, value]) => {
                // Skip the accuracy entry as it's displayed separately
                if (key === 'accuracy') return null;
                
                return (
                  <tr key={key} className="text-center border border-gray-300">
                    <td className="border px-2 py-1 font-medium">{key}</td>
                    <td className="border px-2 py-1">{typeof value.precision === 'number' ? value.precision.toFixed(2) : 'N/A'}</td>
                    <td className="border px-2 py-1">{typeof value.recall === 'number' ? value.recall.toFixed(2) : 'N/A'}</td>
                    <td className="border px-2 py-1">{typeof value["f1-score"] === 'number' ? value["f1-score"].toFixed(2) : 'N/A'}</td>
                    <td className="border px-2 py-1">{value.support || 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassificationSummary;
