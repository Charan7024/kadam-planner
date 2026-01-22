import React, { useState, useEffect } from 'react';

export default function VibePlanner() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState('daily');
  const [notes, setNotes] = useState('');
  const [currentVibe, setCurrentVibe] = useState('focus');
  const [currentMood, setCurrentMood] = useState(null);
  const [currentDate, setCurrentDate] = useState('');
  const [theme, setTheme] = useState('warm');
  
  // Pomodoro timer states
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('work'); // 'work' or 'break'
  
  // Streak tracking
  const [streak, setStreak] = useState(0);
  const [lastCompletionDate, setLastCompletionDate] = useState(null);

  // Theme configurations
  const themes = {
    warm: {
      bgGradient: 'linear-gradient(135deg, #f8f6f3 0%, #fef9f4 100%)',
      bgPrimary: '#f8f6f3',
      bgSecondary: '#fff',
      textPrimary: '#2d2d2d',
      textSecondary: '#6b6b6b',
      accent: '#d4a574',
      accentDark: '#b8835a',
      accentLight: '#f4e4d4',
      orbColor: 'rgba(212, 165, 116, 0.08)'
    },
    dark: {
      bgGradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      bgPrimary: '#2d2d2d',
      bgSecondary: '#3a3a3a',
      textPrimary: '#f0f0f0',
      textSecondary: '#a0a0a0',
      accent: '#8b7355',
      accentDark: '#6b5845',
      accentLight: '#4a4a4a',
      orbColor: 'rgba(139, 115, 85, 0.15)'
    },
    ocean: {
      bgGradient: 'linear-gradient(135deg, #e0f2f7 0%, #f0f8fa 100%)',
      bgPrimary: '#e0f2f7',
      bgSecondary: '#fff',
      textPrimary: '#1e3a5f',
      textSecondary: '#5a7a9b',
      accent: '#4a9ebb',
      accentDark: '#357a8f',
      accentLight: '#d4ebf2',
      orbColor: 'rgba(74, 158, 187, 0.08)'
    },
    sunset: {
      bgGradient: 'linear-gradient(135deg, #fff5f0 0%, #ffe8e0 100%)',
      bgPrimary: '#fff5f0',
      bgSecondary: '#fff',
      textPrimary: '#4a2c2a',
      textSecondary: '#8b6f6d',
      accent: '#ff7f66',
      accentDark: '#e56550',
      accentLight: '#ffd4cc',
      orbColor: 'rgba(255, 127, 102, 0.1)'
    },
    forest: {
      bgGradient: 'linear-gradient(135deg, #f0f4f0 0%, #e8f0e8 100%)',
      bgPrimary: '#e8f0e8',
      bgSecondary: '#fff',
      textPrimary: '#2d4a2d',
      textSecondary: '#6b8b6b',
      accent: '#6b9b6b',
      accentDark: '#4a7a4a',
      accentLight: '#d4e8d4',
      orbColor: 'rgba(107, 155, 107, 0.08)'
    }
  };

  const currentTheme = themes[theme];

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('kadamsplannerTasks');
    const savedNotes = localStorage.getItem('kadamsplannerNotes');
    const savedVibe = localStorage.getItem('kadamsplannerVibe');
    const savedMood = localStorage.getItem('kadamsplannerMood');
    const savedTheme = localStorage.getItem('kadamsplannerTheme');
    const savedStreak = localStorage.getItem('kadamsplannerStreak');
    const savedLastDate = localStorage.getItem('kadamsplannerLastDate');

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedNotes) setNotes(savedNotes);
    if (savedVibe) setCurrentVibe(savedVibe);
    if (savedMood) setCurrentMood(savedMood);
    if (savedTheme) setTheme(savedTheme);
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedLastDate) setLastCompletionDate(savedLastDate);

    updateDate();
    checkAndAddRecurringTasks();
  }, []);

  // Pomodoro timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(time => time - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsTimerRunning(false);
      // Play notification sound or show alert
      if (timerMode === 'work') {
        alert('🎉 Great work! Time for a break!');
        setTimerMode('break');
        setPomodoroTime(5 * 60);
      } else {
        alert('✨ Break over! Ready to focus?');
        setTimerMode('work');
        setPomodoroTime(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroTime, timerMode]);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('kadamsplannerTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('kadamsplannerNotes', notes);
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('kadamsplannerVibe', currentVibe);
  }, [currentVibe]);

  useEffect(() => {
    localStorage.setItem('kadamsplannerMood', currentMood);
  }, [currentMood]);

  useEffect(() => {
    localStorage.setItem('kadamsplannerTheme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('kadamsplannerStreak', streak.toString());
  }, [streak]);

  useEffect(() => {
    if (lastCompletionDate) {
      localStorage.setItem('kadamsplannerLastDate', lastCompletionDate);
    }
  }, [lastCompletionDate]);

  const updateDate = () => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(now.toLocaleDateString('en-US', options));
  };

  const checkAndAddRecurringTasks = () => {
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem('kadamsplannerLastRecurringCheck');
    
    if (lastCheck !== today) {
      const savedTasks = localStorage.getItem('kadamsplannerTasks');
      if (savedTasks) {
        const allTasks = JSON.parse(savedTasks);
        const recurringTasks = allTasks.filter(t => t.recurring);
        
        recurringTasks.forEach(task => {
          const shouldAdd = task.recurringType === 'daily' || 
            (task.recurringType === 'weekly' && new Date().getDay() === 1);
          
          if (shouldAdd) {
            const exists = allTasks.some(t => 
              t.text === task.text && 
              !t.completed && 
              t.createdDate === today
            );
            
            if (!exists) {
              allTasks.push({
                ...task,
                id: Date.now() + Math.random(),
                completed: false,
                createdDate: today
              });
            }
          }
        });
        
        setTasks(allTasks);
      }
      localStorage.setItem('kadamsplannerLastRecurringCheck', today);
    }
  };

  const addTask = () => {
    if (taskInput.trim()) {
      const newTask = {
        text: taskInput.trim(),
        completed: false,
        id: Date.now(),
        priority: taskPriority,
        recurring: isRecurring,
        recurringType: isRecurring ? recurringType : null,
        createdDate: new Date().toDateString()
      };
      setTasks([...tasks, newTask]);
      setTaskInput('');
      setTaskPriority('medium');
      setIsRecurring(false);
    }
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    
    // Update streak when completing a task
    const completedToday = updatedTasks.some(t => t.completed);
    if (completedToday) {
      updateStreak();
    }
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastCompletionDate === today) {
      return; // Already counted today
    } else if (lastCompletionDate === yesterday || lastCompletionDate === null) {
      setStreak(streak + 1);
      setLastCompletionDate(today);
    } else {
      setStreak(1);
      setLastCompletionDate(today);
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setPomodoroTime(timerMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    progress: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0
  };

  const vibes = [
    { name: 'focus', label: 'Focus' },
    { name: 'chill', label: 'Chill' },
    { name: 'grind', label: 'Grind' }
  ];

  const moods = [
    { emoji: '🤩', name: 'amazing' },
    { emoji: '😊', name: 'good' },
    { emoji: '😐', name: 'okay' },
    { emoji: '😔', name: 'meh' },
    { emoji: '😰', name: 'stressed' }
  ];

  const priorityColors = {
    high: '#ff6b6b',
    medium: '#ffd93d',
    low: '#6bcf7f'
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{
      background: currentTheme.bgGradient,
      fontFamily: "'DM Sans', sans-serif",
      transition: 'background 0.5s ease'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes taskSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-30px, 30px) rotate(5deg); }
          66% { transform: translate(20px, -20px) rotate(-5deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .container { animation: fadeIn 0.8s ease-out; }
        .header { animation: slideDown 0.6s ease-out; }
        .date-card { animation: slideUp 0.6s ease-out 0.2s backwards; }
        .main-grid { animation: slideUp 0.6s ease-out 0.3s backwards; }
        .task-item { animation: taskSlideIn 0.4s ease-out; }
        
        .floating-orb {
          position: fixed;
          top: -50%;
          right: -20%;
          width: 60%;
          height: 100%;
          background: radial-gradient(circle, ${currentTheme.orbColor} 0%, transparent 70%);
          pointer-events: none;
          animation: float 20s ease-in-out infinite;
          z-index: 0;
          transition: background 0.5s ease;
        }

        .timer-running {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="floating-orb" />

      <div className="max-w-7xl mx-auto relative z-10 container">
        {/* Header */}
        <header className="text-center mb-8 header">
          <h1 className="text-4xl md:text-6xl font-bold mb-2" style={{
            fontFamily: "'Playfair Display', serif",
            color: currentTheme.textPrimary,
            letterSpacing: '-0.02em'
          }}>
            Kadams Planner ✨
          </h1>
          <p className="text-base md:text-lg" style={{ 
            letterSpacing: '0.05em',
            color: currentTheme.textSecondary
          }}>
            Your intentional daily companion
          </p>
        </header>

        {/* Theme Selector */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {Object.keys(themes).map(themeName => (
            <button
              key={themeName}
              onClick={() => setTheme(themeName)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                theme === themeName ? 'ring-2' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                background: themes[themeName].accent,
                color: themeName === 'dark' ? '#f0f0f0' : '#fff',
                ringColor: themes[themeName].accentDark
              }}
            >
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </button>
          ))}
        </div>

        {/* Date Display with Streak */}
        <div className="p-4 md:p-6 rounded-3xl shadow-lg mb-6 date-card" style={{
          background: currentTheme.bgSecondary
        }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="text-lg md:text-xl font-medium" style={{ color: currentTheme.textPrimary }}>
                {currentDate}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                background: currentTheme.accentLight
              }}>
                <span className="text-2xl">🔥</span>
                <span className="font-bold text-lg" style={{ color: currentTheme.accent }}>
                  {streak} day streak
                </span>
              </div>
            </div>
            <div className="flex gap-2 md:gap-3 flex-wrap justify-center">
              {vibes.map(vibe => (
                <button
                  key={vibe.name}
                  onClick={() => setCurrentVibe(vibe.name)}
                  className="px-4 md:px-5 py-2 md:py-2.5 rounded-full border-2 transition-all duration-300 text-sm md:text-base"
                  style={{
                    background: currentVibe === vibe.name ? currentTheme.accent : 'transparent',
                    color: currentVibe === vibe.name ? '#fff' : currentTheme.textPrimary,
                    borderColor: currentVibe === vibe.name ? currentTheme.accent : currentTheme.textSecondary + '40',
                    transform: currentVibe === vibe.name ? 'translateY(-2px)' : 'none'
                  }}
                >
                  {vibe.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 main-grid">
          {/* Pomodoro Timer */}
          <div className="p-6 md:p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{
            background: currentTheme.bgSecondary
          }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2" style={{
              fontFamily: "'Playfair Display', serif",
              color: currentTheme.textPrimary
            }}>
              ⏰ Pomodoro
            </h2>
            
            <div className={`text-center mb-6 ${isTimerRunning ? 'timer-running' : ''}`}>
              <div className="text-5xl md:text-7xl font-bold mb-2" style={{
                fontFamily: "'Playfair Display', serif",
                color: currentTheme.accent
              }}>
                {formatTime(pomodoroTime)}
              </div>
              <div className="text-sm uppercase tracking-wider" style={{ color: currentTheme.textSecondary }}>
                {timerMode === 'work' ? 'Focus Time' : 'Break Time'}
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <button
                onClick={toggleTimer}
                className="flex-1 py-3 rounded-2xl font-medium transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: currentTheme.accent,
                  color: '#fff'
                }}
              >
                {isTimerRunning ? '⏸ Pause' : '▶ Start'}
              </button>
              <button
                onClick={resetTimer}
                className="px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: currentTheme.accentLight,
                  color: currentTheme.textPrimary
                }}
              >
                Reset
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTimerMode('work');
                  setPomodoroTime(25 * 60);
                  setIsTimerRunning(false);
                }}
                className="flex-1 py-2 rounded-xl text-sm transition-all duration-300"
                style={{
                  background: timerMode === 'work' ? currentTheme.accentLight : currentTheme.bgPrimary,
                  color: currentTheme.textPrimary
                }}
              >
                25 min
              </button>
              <button
                onClick={() => {
                  setTimerMode('break');
                  setPomodoroTime(5 * 60);
                  setIsTimerRunning(false);
                }}
                className="flex-1 py-2 rounded-xl text-sm transition-all duration-300"
                style={{
                  background: timerMode === 'break' ? currentTheme.accentLight : currentTheme.bgPrimary,
                  color: currentTheme.textPrimary
                }}
              >
                5 min
              </button>
            </div>
          </div>

          {/* Tasks Card */}
          <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{
            background: currentTheme.bgSecondary
          }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2" style={{
              fontFamily: "'Playfair Display', serif",
              color: currentTheme.textPrimary
            }}>
              📋 Today's Tasks
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder="What needs to be done?"
                  className="flex-1 px-4 md:px-5 py-3 md:py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-sm md:text-base"
                  style={{ 
                    background: currentTheme.bgPrimary,
                    borderColor: currentTheme.textSecondary + '40',
                    color: currentTheme.textPrimary
                  }}
                />
                <button
                  onClick={addTask}
                  className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-medium hover:-translate-y-0.5 transition-all duration-300 active:translate-y-0 text-sm md:text-base"
                  style={{
                    background: currentTheme.accent,
                    color: '#fff'
                  }}
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setTaskPriority('high')}
                    className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300"
                    style={{
                      background: taskPriority === 'high' ? priorityColors.high : currentTheme.bgPrimary,
                      color: taskPriority === 'high' ? '#fff' : currentTheme.textPrimary
                    }}
                  >
                    🔴 High
                  </button>
                  <button
                    onClick={() => setTaskPriority('medium')}
                    className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300"
                    style={{
                      background: taskPriority === 'medium' ? priorityColors.medium : currentTheme.bgPrimary,
                      color: taskPriority === 'medium' ? '#000' : currentTheme.textPrimary
                    }}
                  >
                    🟡 Medium
                  </button>
                  <button
                    onClick={() => setTaskPriority('low')}
                    className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300"
                    style={{
                      background: taskPriority === 'low' ? priorityColors.low : currentTheme.bgPrimary,
                      color: taskPriority === 'low' ? '#fff' : currentTheme.textPrimary
                    }}
                  >
                    🟢 Low
                  </button>
                </div>

                <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-xs md:text-sm" style={{
                  background: currentTheme.bgPrimary,
                  color: currentTheme.textPrimary
                }}>
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>🔄 Recurring</span>
                </label>

                {isRecurring && (
                  <select
                    value={recurringType}
                    onChange={(e) => setRecurringType(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-xs md:text-sm"
                    style={{
                      background: currentTheme.bgPrimary,
                      color: currentTheme.textPrimary,
                      border: 'none'
                    }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                )}
              </div>
            </div>

            <ul className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {sortedTasks.map((task) => (
                <li
                  key={task.id}
                  className={`task-item flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl transition-all duration-300 hover:shadow-md group ${
                    task.completed ? 'opacity-60' : ''
                  }`}
                  style={{ background: currentTheme.bgPrimary }}
                >
                  <div
                    className="w-2 h-8 md:h-10 rounded-full flex-shrink-0"
                    style={{ background: priorityColors[task.priority] }}
                  />
                  <div
                    onClick={() => toggleTask(task.id)}
                    className="w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 cursor-pointer transition-all duration-300 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: currentTheme.accent,
                      background: task.completed ? currentTheme.accent : 'transparent'
                    }}
                  >
                    {task.completed && <span className="text-white text-xs md:text-sm">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm md:text-base block ${task.completed ? 'line-through' : ''}`} style={{
                      color: task.completed ? currentTheme.textSecondary : currentTheme.textPrimary
                    }}>
                      {task.text}
                    </span>
                    {task.recurring && (
                      <span className="text-xs" style={{ color: currentTheme.textSecondary }}>
                        🔄 {task.recurringType}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-xl md:text-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-125 flex-shrink-0"
                    style={{ color: currentTheme.textSecondary }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <div className="p-4 md:p-5 rounded-2xl text-center" style={{ background: currentTheme.bgPrimary }}>
                <div className="text-2xl md:text-3xl font-bold" style={{ 
                  fontFamily: "'Playfair Display', serif",
                  color: currentTheme.accent
                }}>
                  {stats.total}
                </div>
                <div className="text-xs uppercase tracking-wider mt-1" style={{ color: currentTheme.textSecondary }}>
                  Total
                </div>
              </div>
              <div className="p-4 md:p-5 rounded-2xl text-center" style={{ background: currentTheme.bgPrimary }}>
                <div className="text-2xl md:text-3xl font-bold" style={{ 
                  fontFamily: "'Playfair Display', serif",
                  color: currentTheme.accent
                }}>
                  {stats.completed}
                </div>
                <div className="text-xs uppercase tracking-wider mt-1" style={{ color: currentTheme.textSecondary }}>
                  Done
                </div>
              </div>
              <div className="p-4 md:p-5 rounded-2xl text-center" style={{ background: currentTheme.bgPrimary }}>
                <div className="text-2xl md:text-3xl font-bold" style={{ 
                  fontFamily: "'Playfair Display', serif",
                  color: currentTheme.accent
                }}>
                  {stats.progress}%
                </div>
                <div className="text-xs uppercase tracking-wider mt-1" style={{ color: currentTheme.textSecondary }}>
                  Progress
                </div>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="p-6 md:p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{
            background: currentTheme.bgSecondary
          }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2" style={{
              fontFamily: "'Playfair Display', serif",
              color: currentTheme.textPrimary
            }}>
              💭 Notes
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down ideas, reflections..."
              className="w-full h-48 md:h-64 p-4 md:p-5 border-2 rounded-2xl focus:outline-none transition-all duration-300 resize-none text-sm md:text-base"
              style={{ 
                background: currentTheme.bgPrimary,
                borderColor: currentTheme.textSecondary + '40',
                lineHeight: '1.6',
                color: currentTheme.textPrimary
              }}
            />
          </div>

          {/* Mood Tracker Card */}
          <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{
            background: currentTheme.bgSecondary
          }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2" style={{
              fontFamily: "'Playfair Display', serif",
              color: currentTheme.textPrimary
            }}>
              🌈 Today's Mood
            </h2>
            <div className="grid grid-cols-5 gap-3 md:gap-4">
              {moods.map((mood) => (
                <button
                  key={mood.name}
                  onClick={() => setCurrentMood(mood.name)}
                  className="aspect-square border-2 rounded-2xl text-3xl md:text-5xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{
                    background: currentMood === mood.name ? currentTheme.accentLight : currentTheme.bgPrimary,
                    borderColor: currentMood === mood.name ? currentTheme.accent : currentTheme.textSecondary + '40',
                    transform: currentMood === mood.name ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
