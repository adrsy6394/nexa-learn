// src/pages/LearningPage.jsx
import React, { useState, useContext } from "react";
import { Brain, Play, Pause, FileText } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

import TopicInput from "../components/features/TopicInput";
import LanguageToggle from "../components/common/LanguageToggle";
import { fetchExplanation } from "../API/openai";

import { useTextToSpeech } from "../components/common/useTextToSpeech";
import { useTypedMarkdown } from "../components/common/useTypedMarkdown";
import MarkdownRenderer from "../components/features/MarkdownRenderer";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import Button from "../components/ui/button";
import Input from "../components/ui/input";

const LearningPage = () => {
  const { user } = useContext(AuthContext);
  const [selectedSubject, setSelectedSubject] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [language, setLanguage] = useState("English");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const { speak, stop, speaking, supported } = useTextToSpeech();

  const typedMarkdown = useTypedMarkdown(explanation, 5);

 // Fetch explanation for the current topic and update progress
const handleGetExplanation = async () => {
  const topic = customTopic || selectedTopic;
  if (!selectedSubject || !topic) return; // need subject and topic

  setLoading(true); // start loading indicator
  try {
    // get explanation (assumed async API)
    const result = await fetchExplanation({
      subject: selectedSubject,
      topic,
      language,
    });
    setExplanation(result); // store explanation for display/use

   
  } catch (error) {
    console.error(error); // log any error
  } finally {
    setLoading(false); // end loading indicator
  }
};

// Export current explanation and metadata as a .txt file
const exportToPDF = () => {
  const content = `Subject: ${selectedSubject}\nTopic: ${
    customTopic || selectedTopic
  }\nLanguage: ${language}\n\nExplanation:\n${explanation}`;
  const blob = new Blob([content], { type: "text/plain" }); // create file blob
  const url = URL.createObjectURL(blob); // temporary download URL
  const a = document.createElement("a"); // anchor to trigger download
  a.href = url;
  a.download = `${selectedSubject}_${customTopic || selectedTopic}.txt`; // filename
  a.click(); // start download
  URL.revokeObjectURL(url); // cleanup
};


  return (
    <div className="my-36 min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-all duration-300 ">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          AI-Powered Learning
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="dark:bg-gradient-to-r from-indigo-600 to-purple-600  dark:text-white shadow-xl border-2">
            <CardHeader>
              <CardTitle>Select Your Topic</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Choose a topic for personalized explanation
              </CardDescription>
            </CardHeader>
            <CardContent className=" space-y-4 dark:text-gray-500">
            
              {selectedSubject && (
                <div>
                  <label className=" block text-sm font-medium mb-1 dark:text-gray-300">
                    Topic
                  </label>
                  <TopicInput onSubmit={setSelectedTopic} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Or Custom Topic
                </label>
                <Input
                  value={customTopic}
                  onChange={(e) => {
                    setCustomTopic(e.target.value);
                    setSelectedTopic("");
                  }}
                  placeholder="Enter your specific doubt"
                />
              </div>
              <LanguageToggle value={language} onChange={setLanguage} />
              <Button
                onClick={handleGetExplanation}
                disabled={
                  loading ||
                  (!selectedTopic && !customTopic) ||
                  !selectedSubject
                }
                className="cursor-pointer w-full dark:bg-green-600"
              >
                {loading ? "Generating..." : "Get Explanation"}
              </Button>
            </CardContent>
          </Card>

          <Card className="dark:bg-gradient-to-r from-indigo-600 to-purple-600 dark:text-white border-2 shadow-xl">
            <CardHeader>
              <CardTitle>AI Explanation</CardTitle>
              <CardDescription className="text-gray-400">
                Personalized in {language}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {explanation ? (
                <>
                  <div className="p-8 dark:bg-gray-800 bg-gray-200 rounded-lg shadow-md">
                    <MarkdownRenderer content={typedMarkdown} />
                  </div>

                  <div className="mt-4 flex space-x-2 items-center justify-center ">
                    {supported && explanation && (
                      <Button
                        className="border-gray-700 w-20 h-14 text-black dark:border-white-700 dark:bg-pink-800"
                        onClick={() => (speaking ? stop() : speak(explanation))}
                        variant="outline"
                        size="sm"
                        title="Toggle Speech"
                      >
                        {speaking ? (
                          <Pause className="w-8 h-8 ml-2 dark:text-white text-black" />
                        ) : (
                          <Play className="w-8 h-8 ml-2 dark:text-white text-black" />
                        )}
                      </Button>
                    )}
                    <Button
                      className="dark:border-white-700 h-[56px] border-gray-700 w-20 text-black dark:bg-pink-800"
                      onClick={exportToPDF}
                      variant="outline"
                      title="Export PDF"
                      size="sm"
                    >
                      <FileText className="text-green-600 w-12 h-10 dark:text-white" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Brain className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a topic and language to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
             <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 mt-20 w-full shadow-inner  ">
  <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
    <div>
      <h4 className="font-semibold mb-2">About</h4>
      <ul className="space-y-1">
        <li><a href="#" className="hover:underline">Team</a></li>
        <li><a href="#" className="hover:underline">Mission</a></li>
        <li><a href="#" className="hover:underline">Contact</a></li>
      </ul>
    </div>
    <div>
      <h4 className="font-semibold mb-2">Resources</h4>
      <ul className="space-y-1">
        <li><a href="#" className="hover:underline">Docs</a></li>
        <li><a href="#" className="hover:underline">GitHub</a></li>
        <li><a href="#" className="hover:underline">API</a></li>
      </ul>
    </div>
    <div>
      <h4 className="font-semibold mb-2">Follow Us</h4>
      <ul className="space-y-1">
        <li><a href="#" className="hover:underline">Instagram</a></li>
        <li><a href="#" className="hover:underline">Twitter</a></li>
        <li><a href="#" className="hover:underline">LinkedIn</a></li>
      </ul>
    </div>
  </div>
  <div className="text-center text-xs py-4 border-t border-gray-300 dark:border-gray-700">
    © 2025 NexaLearn. All rights reserved.
  </div>
</footer>
    </div>
  );
};

export default LearningPage;
