import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export interface SQLEntry {
  id: number;
  query: string;
  source_tables: string[];
  target_tables: string[];
  created_at: string;
  updated_at: string;
}

export interface APIResponse {
  entries: SQLEntry[];
}

interface ProcessedNode {
  id: string;
  type: "source" | "target" | "query";
  label: string;
  position: { x: number; y: number };
  details?: {
    query?: string;
    timestamp?: string;
    tables?: string[];
  };
}

interface ProcessedConnection {
  id: string;
  source: string;
  target: string;
  label?: string;
}

const GraphDisplay: React.FC<{ apiData?: APIResponse; loading?: boolean }> = ({
  apiData,
  loading,
}) => {
  const [nodes, setNodes] = useState<ProcessedNode[]>([]);
  const [connections, setConnections] = useState<ProcessedConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 800,
    height: 600,
  });

  useEffect(() => {
    console.log("apiData received:", apiData); // Debug log

    if (apiData?.entries && apiData.entries.length > 0) {
      console.log("Processing entries:", apiData.entries.length); // Debug log
      const processedData = processApiData(apiData);
      console.log("Processed nodes:", processedData.nodes); // Debug log
      console.log("Processed connections:", processedData.connections); // Debug log

      setNodes(processedData.nodes);
      setConnections(processedData.connections);

      // Calculate container dimensions based on number of entries
      const newWidth = Math.max(800, apiData.entries.length * 400); // More horizontal space
      const maxTables = Math.max(
        ...apiData.entries.map((entry) =>
          Math.max(entry.source_tables.length, entry.target_tables.length)
        )
      );
      const newHeight = Math.max(600, maxTables * 100);

      console.log("New container dimensions:", {
        width: newWidth,
        height: newHeight,
      }); // Debug log
      setContainerDimensions({ width: newWidth, height: newHeight });
    }
  }, [apiData]);

  const processApiData = (data: APIResponse) => {
    const nodes: ProcessedNode[] = [];
    const connections: ProcessedConnection[] = [];
    let nodeId = 0;

    // Constants for layout
    const horizontalSpacing = 400; // Space between query columns
    const verticalSpacing = 100; // Space between nodes in a column
    const baseY = 300; // Vertical center point

    data.entries.forEach((entry, entryIndex) => {
      console.log("Processing entry:", entry); // Debug log

      const columnX = (entryIndex + 1) * horizontalSpacing;

      // Add query node
      const queryNodeId = `query-${entry.id}`;
      nodes.push({
        id: queryNodeId,
        type: "query",
        label: `Query ${entry.id}`,
        position: {
          x: columnX,
          y: baseY,
        },
        details: {
          query: entry.query,
          timestamp: entry.created_at,
        },
      });

      // Process source tables
      entry.source_tables.forEach((table, idx) => {
        const sourceNodeId = `source-${nodeId++}`;
        nodes.push({
          id: sourceNodeId,
          type: "source",
          label: table,
          position: {
            x: columnX,
            y: baseY - (idx + 1) * verticalSpacing,
          },
          details: {
            tables: [table],
          },
        });

        connections.push({
          id: `conn-${nodeId}`,
          source: sourceNodeId,
          target: queryNodeId,
          label: "reads",
        });
      });

      // Process target tables
      entry.target_tables.forEach((table, idx) => {
        const targetNodeId = `target-${nodeId++}`;
        nodes.push({
          id: targetNodeId,
          type: "target",
          label: table,
          position: {
            x: columnX,
            y: baseY + (idx + 1) * verticalSpacing,
          },
          details: {
            tables: [table],
          },
        });

        connections.push({
          id: `conn-${nodeId}`,
          source: queryNodeId,
          target: targetNodeId,
          label: "writes",
        });
      });
    });

    console.log("Generated nodes:", nodes); // Debug log
    console.log("Generated connections:", connections); // Debug log

    return { nodes, connections };
  };

  const NodeComponent: React.FC<{
    node: ProcessedNode;
    isSelected: boolean;
    onClick: () => void;
  }> = ({ node, isSelected, onClick }) => {
    const getBackgroundColor = () => {
      if (isSelected) return "bg-blue-100";
      switch (node.type) {
        case "source":
          return "bg-green-50";
        case "target":
          return "bg-purple-50";
        case "query":
          return "bg-orange-50";
        default:
          return "bg-white";
      }
    };

    return (
      <div
        className={`absolute p-4 rounded-lg shadow-sm cursor-pointer 
          ${getBackgroundColor()} 
          ${isSelected ? "border-2 border-blue-500" : "border border-gray-200"}
          hover:shadow-md transition-all duration-200 w-48`}
        style={{
          left: node.position.x,
          top: node.position.y,
          transform: "translate(-50%, -50%)",
        }}
        onClick={onClick}
      >
        <div className="text-sm font-medium truncate">{node.label}</div>
        {isSelected && node.details && (
          <div className="mt-2 text-xs text-gray-600">
            {node.details.query && (
              <div className="mb-1">
                <strong>Query:</strong> {node.details.query}
              </div>
            )}
            {node.details.timestamp && (
              <div className="mb-1">
                <strong>Created:</strong>{" "}
                {new Date(node.details.timestamp).toLocaleString()}
              </div>
            )}
            {node.details.tables && (
              <div>
                <strong>Tables:</strong> {node.details.tables.join(", ")}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const ConnectionLine: React.FC<{
    start: { x: number; y: number };
    end: { x: number; y: number };
    label?: string;
  }> = ({ start, end, label }) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const length = Math.sqrt(dx * dx + dy * dy);

    return (
      <div
        className="absolute"
        style={{
          left: start.x,
          top: start.y,
          width: length,
          height: 2,
          backgroundColor: "#94A3B8",
          transform: `rotate(${angle}deg)`,
          transformOrigin: "0 0",
        }}
      >
        {label && (
          <div
            className="absolute bg-white px-2 py-1 rounded text-xs text-gray-600"
            style={{
              left: "50%",
              top: "-12px",
              transform: `rotate(-${angle}deg) translateX(-50%)`,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </Card>
    );
  }

  if (!apiData?.entries || apiData.entries.length === 0) {
    return (
      <Card className="flex items-center justify-center h-[600px] text-gray-500">
        <p>Soon</p>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-auto" style={{ height: "600px" }}>
      <div
        style={{
          position: "relative",
          width: containerDimensions.width,
          height: containerDimensions.height,
          minWidth: "100%",
        }}
      >
        {connections.map((conn) => {
          const sourceNode = nodes.find((n) => n.id === conn.source);
          const targetNode = nodes.find((n) => n.id === conn.target);
          if (!sourceNode || !targetNode) return null;

          return (
            <ConnectionLine
              key={conn.id}
              start={sourceNode.position}
              end={targetNode.position}
              label={conn.label}
            />
          );
        })}

        {nodes.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNode === node.id}
            onClick={() =>
              setSelectedNode(node.id === selectedNode ? null : node.id)
            }
          />
        ))}
      </div>
    </Card>
  );
};

export default GraphDisplay;
