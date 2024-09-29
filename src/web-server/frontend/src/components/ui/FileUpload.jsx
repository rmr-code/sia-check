import { useRef } from 'react';
import InfoBlock from './InfoBlock';

const FileUpload = ({
  onFileUpload,
  accept,
  multiple = true,
}) => {
  const fileInputRef = useRef(null);

  const handleDrop = (ev) => {
    ev.preventDefault();
    const droppedFiles = Array.from(ev.dataTransfer.files);
    onFileUpload(droppedFiles);
  };

  const handleFileUpload = (ev) => {
    if (ev.target.files) {
      const selectedFiles = Array.from(ev.target.files);
      onFileUpload(selectedFiles);
    }
  };

  const handleFileDragOver = (ev) => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'copy'; // Indicate that files can be copied
  };

  return (
    <div
      className="cursor-pointer file-upload-area border border-dashed border-gray-400 p-4 mt-4"
      onDrop={handleDrop}
      onDragOver={handleFileDragOver}
      onClick={() => fileInputRef.current?.click()}
    >
      <InfoBlock>Drag and drop files here, or click to upload</InfoBlock>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        multiple={multiple}
        accept={accept}
      />
    </div>
  );
};

export default FileUpload;
