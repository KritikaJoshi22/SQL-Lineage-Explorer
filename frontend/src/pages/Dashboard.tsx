import React, { useState } from "react";
import FileUpload from "@/components/FIleUpload";
import GraphDisplay from "@/components/GraphData";
import { Button } from "@/components/ui/button";
import axios from "axios";

const Dashboard: React.FC = () => {
  const [viewGraph, setViewGraph] = useState(false);
  const handleCreateLineage = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/sql/analyze");
      console.log("Lineage created:", response.data);
      alert(response.data);
    } catch (error) {
      console.error("Failed to create lineage:", error);
    }
  };

  // return (
  //   <div className="min-h-screen bg-[#f8fafc]">
  //     <div className="max-w-7xl mx-auto px-6 py-8">
  //       {/* Header */}
  //       <header className="mb-10">
  //         <h1 className="text-4xl font-bold text-[#1e293b] mb-3">
  //           SQL Lineage Explorer
  //         </h1>
  //         <p className="text-lg text-[#64748b]">
  //           Visualize and analyze your SQL query relationships
  //         </p>
  //       </header>

  //       <div className="space-y-8">
  //         {/* Upload Section */}
  //         <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
  //           <div className="p-6">
  //             <h2 className="text-2xl font-semibold text-[#334155] mb-6">
  //               Upload SQL Files
  //             </h2>
  //             <FileUpload />
  //           </div>
  //         </section>

  //         {/* Graph Section */}
  //         <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
  //           <div className="p-6">
  //             <div className="flex items-center justify-between mb-6">
  //               <h2 className="text-2xl font-semibold text-[#334155]">
  //                 Lineage Graph
  //               </h2>
  //               <Button
  //                 onClick={handleCreateLineage}
  //                 className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium px-6 py-2 rounded-lg transition-colors"
  //               >
  //                 Generate Lineage
  //               </Button>
  //             </div>
  //             <div className="bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
  //               <GraphDisplay />
  //             </div>
  //           </div>
  //         </section>
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
    <div className=" min-h-screen flex items-center justify-center">
      <div className=" text-white border-2 border-dashed border-border border-white p-6 bg-background w-2/3 rounded">
        {/* Title */}
        <h1 className=" font-sans text-center text-white text-2xl font-bold mb-8 text-foreground font-funky">
          SQL Lineage Explorer
        </h1>

        <div className="space-y-4">
          {/* Top Section */}
          <div className="grid grid-cols-2 gap-4">
            {/* Upload Section */}
            <div className=" rounded border-white border-2 border-dashed border-border  p-6">
              <FileUpload />
            </div>

            {/* Generate Section */}
            <div className=" flex items-center justify-center text-white border-white border-2 border-dashed border-border rounded p-6">
              <Button
                variant="outline"
                onClick={handleCreateLineage}
                className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-200 focus:outline-none  rounded border border-gray-200 hover:bg-gray-100 hover:text-blue-700  dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 "
              >
                Generate Lineage
              </Button>
            </div>
          </div>

          {/* Bottom Section */}
          <div
            className={` border-white border-2 border-dashed border-border rounded p-6 min-h-[300px] transition-all duration-300 ${
              viewGraph ? "flex flex-col" : "flex"
            }`}
          >
            <div
              className={`flex w-full text-white ${
                viewGraph
                  ? "justify-between items-start"
                  : "justify-between items-center mx-9"
              } `}
            >
              <Button
                variant="outline"
                className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-200 focus:outline-none  rounded border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                onClick={() => {
                  setViewGraph((prev) => !prev);
                }}
              >
                Get Interactive Graph Display
              </Button>
              <div className="text-xl text-foreground mx-2">Graph Area</div>
            </div>
            {viewGraph && (
              <div className="w-full bg-card rounded-md">
                <GraphDisplay />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
