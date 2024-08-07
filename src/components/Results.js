import React, { useState, useEffect } from 'react';
import '../styles/Results.css';

function Results() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async (retryCount = 0) => {
      const imageKey = localStorage.getItem('lastUploadedImageKey');
      if (!imageKey) {
        setError('No image has been uploaded recently.');
        setLoading(false);
        return;
      }

      try {
        console.log(`Attempting to fetch results for key: ${imageKey}`);
        const response = await fetch(`https://f9ngw4hasj.execute-api.us-east-1.amazonaws.com/dev/image?key=${imageKey}`);
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error response: ${errorText}`);
          
          if (response.status === 404 && retryCount < 5) {
            console.log(`Attempt ${retryCount + 1}: Results not found. Retrying in 2 seconds...`);
            setTimeout(() => fetchResults(retryCount + 1), 2000);
            return;
          } else if (response.status === 500) {
            throw new Error(`Internal Server Error: ${errorText}`);
          } else {
            throw new Error(`Failed to fetch results: ${errorText}`);
          }
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        setResults(data);
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchResults:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!results) return <div className="no-results">No results found.</div>;

  return (
    <div className="results-container">
      <h1 className="results-title">Analysis Results</h1>
      <div className="results-section">
        <h2>Labels:</h2>
        <ul className="results-list">
          {results.Labels.map((label, index) => (
            <li key={index} className="result-item">{label}</li>
          ))}
        </ul>
      </div>
      <div className="results-section">
        <h2>Dietary Plan:</h2>
        <ul className="results-list">
          {results.DietaryPlan.map((item, index) => (
            <li key={index} className="result-item">{item}</li>
          ))}
        </ul>
      </div>
      <div className="confidence-section">
        <h2>Confidence: <span className="confidence-value">{results.Confidence}%</span></h2>
      </div>
    </div>
  );
}

export default Results;