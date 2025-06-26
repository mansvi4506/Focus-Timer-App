import React, { useState, useEffect, useRef } from "react";

const sessionDurations = {
  focus: 1800, // 30 minutes
  short: 300,  // 5 minutes
  long: 900,   // 15 minutes
};

const radius = 110;
const circumference = 2 * Math.PI * radius;

export default function Timer() {
  const [sessionType, setSessionType] = useState("focus");
  const [task, setTask] = useState("");
  const [taskStarted, setTaskStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(sessionDurations.focus);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(
    parseInt(localStorage.getItem("sessionCount")) || 0
  );
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((secs) => {
          if (secs <= 1) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            playAlarm();
            showNotification();
            const updatedCount = sessionCount + 1;
            setSessionCount(updatedCount);
            localStorage.setItem("sessionCount", updatedCount);
            return 0;
          }
          return secs - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, sessionCount]);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isActive || (taskStarted && secondsLeft > 0)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isActive, taskStarted, secondsLeft]);

  const playAlarm = () => {
    const audio = new Audio(
      "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3"
    );
    audio.play();
  };

  const showNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("Focus session complete!", {
        body: `You finished: ${task}`,
        icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
      });
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const changeSession = (type) => {
    if (!isActive) {
      setSessionType(type);
      setSecondsLeft(sessionDurations[type]);
      setTaskStarted(false);
      setTask("");
    }
  };

  const toggleTimer = () => {
    if (!task.trim()) {
      alert("Please enter your task before starting!");
      return;
    }
    setIsActive(!isActive);
    setTaskStarted(true);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setTaskStarted(false);
    setSecondsLeft(sessionDurations[sessionType]);
    setTask("");
  };

  const progress = circumference - (secondsLeft / sessionDurations[sessionType]) * circumference;

  return (
    <div className="max-w-lg mx-auto bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 bg-opacity-95 backdrop-blur-xl rounded-3xl p-16 shadow-3xl text-white font-sans overflow-visible">

      {/* TIMER CIRCLE */}
      <div className="flex justify-center mb-10 overflow-visible">
        <svg
          width="320"
          height="320"
          viewBox="0 0 300 300"
          className="block overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Circle */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            stroke="#4C51BF"
            strokeWidth="15"
            fill="none"
            opacity="0.2"
          />
          {/* Progress Circle */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            stroke="#F472B6"
            strokeWidth="15"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
            transform={`rotate(-90 150 150)`} // start from top
          />
          {/* Timer Text */}
          <text
            x="150"
            y="165"
            textAnchor="middle"
            fontSize="9rem"
            fontWeight="900"
            fontFamily="'Poppins', sans-serif"
            fill="white"
            style={{ userSelect: "none" }}
          >
            {formatTime(secondsLeft)}
          </text>
        </svg>
      </div>

      {/* TASK INPUT */}
      <div className="mb-10">
        <label
          htmlFor="task"
          className="block mb-5 font-bold text-4xl text-pink-300 select-none"
          style={{ color: "#00FFFF" , fontSize: "2.5rem" }}
        >
          🎯 What’s your main task right now?
        </label>
        <input
          type="text"
          id="task"
          className="w-full px-8 py-6 rounded-3xl bg-white bg-opacity-20 text-white placeholder-pink-300 focus:outline-none focus:ring-8 focus:ring-pink-400 focus:ring-opacity-60 transition text-3xl font-semibold"
          placeholder="Type your task here..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          disabled={taskStarted}
        />
      </div>

      {/* SESSION TYPE BUTTONS */}
      <div className="flex justify-center space-x-12 mb-14">
        {["focus", "short", "long"].map((type) => (
          <button
            key={type}
            onClick={() => changeSession(type)}
            disabled={isActive}
            className={`px-10 py-5 rounded-3xl font-extrabold uppercase tracking-wider shadow-lg transition text-3xl ${
              sessionType === type
                ? "bg-pink-600 text-white shadow-pink-500/80"
                : "bg-white bg-opacity-30 text-pink-300 hover:bg-opacity-60"
            }`}
          >
            {type === "focus"
              ? "🧠 Deep Focus Task"
              : type === "short"
              ? "☕ Short Task"
              : "🌴 Long Task"}
          </button>
        ))}
      </div>

      {/* CONTROL BUTTONS */}
      <div className="flex justify-center space-x-16">
        <button
          onClick={toggleTimer}
          className={`px-16 py-7 rounded-3xl font-extrabold text-white shadow-2xl transition text-4xl ${
            isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isActive ? "⏸ Pause" : taskStarted ? "▶ Resume" : "▶ Start"}
        </button>

        <button
          onClick={resetTimer}
          className="px-16 py-7 rounded-3xl font-extrabold bg-gray-700 hover:bg-gray-800 text-white shadow-2xl text-4xl"
        >
          🔄 Reset
        </button>
      </div>

      {/* SESSION COUNT */}
      <p className="mt-20 text-center text-indigo-400 text-3xl select-none font-bold tracking-wide"
      style={{ color: "#A3D9FF", fontSize: "2.5rem" }} >
        Focus sessions completed: <span className="font-extrabold">{sessionCount}</span>
      </p>
    </div>
  );
}
