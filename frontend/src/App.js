import React, { useState } from "react";
import axios from "axios";

function App() {
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    try {
      const res = await axios.get("http://localhost:8000/list-files");
      setFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={fetchFiles}>List S3 Files</button>
      <ul>
        {files.map((file, i) => (
          <li key={i}>{file}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;

