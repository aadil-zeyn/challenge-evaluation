import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChallengeEvaluator = ({ challengeId }) => {
    const [challenge, setChallenge] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [summary, setSummary] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/challenges/search/id?id=${challengeId}`);
                setChallenge(response.data);
                setCode(response.data.boilerplateCode.replace(/\\n/g, '\n'));  // Load boilerplate code into text area
            } catch (err) {
                setError('Failed to fetch challenge');
            }
        };

        fetchChallenge();
    }, [challengeId]);

    const handleCompile = async () => {
        try {
            const response = await axios.post(`http://localhost:8080/api/challenges/evaluate?challengeId=${challengeId}&action=compile`, { code, language, input });
            console.log(response.data)
            setOutput(response.data.result.output);
            setSummary('');
        } catch (err) {
            setError('Failed to compile code');
        }
    };

    const handleRunVisible = async () => {
        try {
            const response = await axios.post(`http://localhost:8080/api/challenges/evaluate?challengeId=${challengeId}&action=visible`, { code, language });
            setOutput(response.data.results.map(r => `Input: ${r.input}, Output: ${r.actualOutput}, Passed: ${r.passed}`).join('\n'));
            setSummary(response.data.summary);
        } catch (err) {
            setError('Failed to run visible test cases');
        }
    };

    const handleRunHidden = async () => {
        try {
            const response = await axios.post(`http://localhost:8080/api/challenges/evaluate?challengeId=${challengeId}&action=hidden`, { code, language });
            setOutput(response.data.hiddenResults.map(r => `Input: ${r.input}, Output: ${r.actualOutput}`).join('\n'));
            setSummary(response.data.summary);
        } catch (err) {
            setError('Failed to run hidden test cases');
        }
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!challenge) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{challenge.title}</h1>
            <p>{challenge.description}</p>
            
            <textarea
                rows="10"
                cols="50"
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />

            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
            </select>

            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Custom input for compile"
            />

            <div>
                <h2>Visible Test Cases:</h2>
                <ul>
                    {challenge.visibleTestCases.map((testCase, index) => (
                        <li key={index}>
                            Input: {testCase.input}, Expected Output: {testCase.expectedOutput}
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <button onClick={handleCompile}>Compile</button>
                <button onClick={handleRunVisible}>Run Visible Test Cases</button>
                <button onClick={handleRunHidden}>Run Hidden Test Cases</button>
            </div>

            {output && (
                <div>
                    <h2>Output:</h2>
                    <pre>{output}</pre>
                </div>
            )}

            {summary && (
                <div>
                    <h2>Summary:</h2>
                    <p>{summary}</p>
                </div>
            )}
        </div>
    );
};

export default ChallengeEvaluator;
