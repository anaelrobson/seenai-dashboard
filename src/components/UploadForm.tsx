'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { uploadVideo } from '@/lib/videoService';
import { Loader2, CheckCircle } from 'lucide-react';

interface Props {
  userId: string;
  onUploaded: () => void;
}

export default function UploadForm({ userId, onUploaded }: Props) {
  const [videoTitle, setVideoTitle] = useState('');
  const [videoCategory, setVideoCategory] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [toneEnabled, setToneEnabled] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async () => {
    setErrorMessage('');
    setSuccessMessage(false);
    if (!videoTitle.trim() || !videoCategory.trim()) {
      return setErrorMessage('Title and category are required.');
    }
    if (!selectedFile) return setErrorMessage('Please select a video file.');

    setUploading(true);
    try {
      await uploadVideo({
        userId,
        file: selectedFile,
        title: videoTitle,
        category: videoCategory,
        description: videoDescription,
        toneEnabled,
      });
      setVideoTitle('');
      setVideoCategory('');
      setVideoDescription('');
      setToneEnabled(true);
      setSelectedFile(null);
      setSuccessMessage(true);
      onUploaded();
    } catch (err) {
      setErrorMessage('Upload failed.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-[#111] border border-zinc-800 rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Upload your video</h2>
      <p className="text-sm text-zinc-400 mb-4">
        SeenAI will analyze your tone, emotion, and transcript to give personalized feedback.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Video Title"
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
          className="bg-black border border-white/20 rounded-lg p-2 w-full"
        />
        <select
          value={videoCategory}
          onChange={(e) => setVideoCategory(e.target.value)}
          className="bg-black border border-white/20 rounded-lg p-2 w-full"
        >
          <option value="">Select Category</option>
          <option value="education">🎓 Education</option>
          <option value="pitch">📈 Pitch</option>
          <option value="speaking">🎙️ Speaking</option>
          <option value="freestyle">🎤 Freestyle</option>
        </select>
      </div>

      <textarea
        placeholder="Describe what’s happening in the video..."
        value={videoDescription}
        onChange={(e) => setVideoDescription(e.target.value)}
        className="w-full bg-black border border-white/20 rounded-lg p-2 mt-4"
      />

      <label className="flex items-center mt-4 text-sm">
        <input
          type="checkbox"
          checked={toneEnabled}
          onChange={(e) => setToneEnabled(e.target.checked)}
          className="mr-2"
        />
        Extract Tone & Emotion
      </label>

      {selectedFile && (
        <video controls className="mt-4 w-full max-h-[300px] rounded-md">
          <source src={URL.createObjectURL(selectedFile)} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {errorMessage && <p className="mt-4 text-red-500 text-sm">{errorMessage}</p>}
      {successMessage && (
        <div className="mt-4 flex items-center gap-2 text-green-500 text-sm">
          <CheckCircle size={16} /> Upload successful!
        </div>
      )}

      <div
        className="mt-6 border border-dashed border-zinc-600 rounded-lg p-6 text-center text-zinc-400 hover:border-white cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleBrowseClick}
      >
        Drag & drop your video here or click to browse files
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          hidden
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="mt-4 text-right">
        <Button onClick={handleUpload} disabled={uploading}>
          {uploading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Upload Video'}
        </Button>
      </div>
    </div>
  );
}
