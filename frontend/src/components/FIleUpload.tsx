import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import axios from "axios";

const FileUpload: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setFiles(e.dataTransfer.files);
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      await axios.post("http://localhost:5000/api/sql/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast({
        title: "Success",
        description: "Files uploaded successfully!",
      });
      setFiles(null);
      setSuccess(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload files.",
        variant: "destructive",
      });
      console.log("Error", error);
      setSuccess(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          isDragging
            ? "border-[#3b82f6] bg-[#eff6ff]"
            : "border-[#e2e8f0] hover:border-[#94a3b8]"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="p-3 rounded-full bg-[#f8fafc]">
            <Upload className="w-8 h-8 text-[#64748b]" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-[#64748b]">
              Drag and drop your SQL files here, or
            </p>
            <label className="cursor-pointer">
              <span className="text-[#3b82f6] hover:text-[#2563eb] font-medium">
                browse files
              </span>
              <Input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".sql"
              />
            </label>
          </div>
          {files && files.length > 0 && (
            <div className="w-full max-w-md">
              <p className="text-sm font-medium text-[#475569] mb-2">
                Selected Files:
              </p>
              <ul className="space-y-2">
                {Array.from(files).map((file, index) => (
                  <li
                    key={index}
                    className="bg-[#f8fafc] px-4 py-2 rounded-lg text-sm text-[#64748b] truncate"
                  >
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {files && files.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleUpload}
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-2 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        </div>
      )}
      {success && (
        <p className="text-white text-center text-sm text-muted-foreground">
          File Uploaded Successfully!
        </p>
      )}
    </div>
  );
};

export default FileUpload;
