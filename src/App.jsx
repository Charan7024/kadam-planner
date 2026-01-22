import React, { useState, useEffect } from 'react';

export default function KadamsPlanner() {
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
  const [timerMode, setTimerMode] = useState('work');
  
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

  // Load data from localStorage
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

  // Pomodoro timer
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(time => time - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsTimerRunning(false);
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

  // Save data
  useEffect(() => { localStorage.setItem('kadamsplannerTasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('kadamsplannerNotes', notes); }, [notes]);
  useEffect(() => { localStorage.setItem('kadamsplannerVibe', currentVibe); }, [currentVibe]);
  useEffect(() => { localStorage.setItem('kadamsplannerMood', currentMood); }, [currentMood]);
  useEffect(() => { localStorage.setItem('kadamsplannerTheme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('kadamsplannerStreak', streak.toString()); }, [streak]);
  useEffect(() => {
    if (lastCompletionDate) localStorage.setItem('kadamsplannerLastDate', lastCompletionDate);
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
              t.text === task.text && !t.completed && t.createdDate === today
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
    
    const completedToday = updatedTasks.some(t => t.completed);
    if (completedToday) updateStreak();
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastCompletionDate === today) {
      return;
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

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  
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

  const styles = {
    container: {
      minHeight: '100vh',
      padding: '2rem 1rem',
      background: currentTheme.bgGradient,
      fontFamily: "'DM Sans', sans-serif",
      transition: 'background 0.5s ease'
    },
    maxWidth: {
      maxWidth: '1400px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: 700,
      color: currentTheme.textPrimary,
      letterSpacing: '-0.02em',
      marginBottom: '0.5rem'
    },
    tagline: {
      fontSize: '1.1rem',
      letterSpacing: '0.05em',
      color: currentTheme.textSecondary
    },
    themeSelector: {
      display: 'flex',
      justifyContent: 'center',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap'
    },
    dateCard: {
      background: currentTheme.bgSecondary,
      padding: '1.5rem',
      borderRadius: '24px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
      marginBottom: '1.5rem',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem'
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem'
    },
    card: {
      background: currentTheme.bgSecondary,
      padding: '2rem',
      borderRadius: '24px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    },
    cardTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '1.8rem',
      marginBottom: '1.5rem',
      color: currentTheme.textPrimary,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-30px, 30px) rotate(5deg); }
          66% { transform: translate(20px, -20px) rotate(-5deg); }
        }
        
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
        
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
        }
        
        @media (max-width: 768px) {
          .main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div className="floating-orb" />

      <div style={styles.maxWidth}>
        <header style={styles.header}>
          <h1 style={styles.title}>Kadams Planner ✨</h1>
          <p style={styles.tagline}>Your intentional daily companion</p>
        </header>

        {/* Theme Selector */}
        <div style={styles.themeSelector}>
          {Object.keys(themes).map(themeName => (
            <button
              key={themeName}
              onClick={() => setTheme(themeName)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '24px',
                fontSize: '0.9rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: themes[themeName].accent,
                color: themeName === 'dark' ? '#f0f0f0' : '#fff',
                opacity: theme === themeName ? 1 : 0.6,
                transform: theme === themeName ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </button>
          ))}
        </div>

        {/* Date Display */}
        <div style={styles.dateCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 500, color: currentTheme.textPrimary }}>
              {currentDate}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '24px',
              background: currentTheme.accentLight
            }}>
              <span style={{ fontSize: '1.5rem' }}>🔥</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: currentTheme.accent }}>
                {streak} day streak
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {vibes.map(vibe => (
              <button
                key={vibe.name}
                onClick={() => setCurrentVibe(vibe.name)}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '24px',
                  border: `2px solid ${currentVibe === vibe.name ? currentTheme.accent : 'rgba(0,0,0,0.1)'}`,
                  background: currentVibe === vibe.name ? currentTheme.accent : 'transparent',
                  color: currentVibe === vibe.name ? '#fff' : currentTheme.textPrimary,
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  transition: 'all 0.3s ease'
                }}
              >
                {vibe.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div style={styles.mainGrid} className="main-grid">
          {/* Pomodoro Timer */}
          <div style={styles.card} className="card">
            <h2 style={styles.cardTitle}>⏰ Pomodoro</h2>
            
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '4rem',
                fontWeight: 700,
                color: currentTheme.accent,
                marginBottom: '0.5rem'
              }}>
                {formatTime(pomodoroTime)}
              </div>
              <div style={{
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: currentTheme.textSecondary
              }}>
                {timerMode === 'work' ? 'Focus Time' : 'Break Time'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <button
                onClick={toggleTimer}
                style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: '16px',
                  border: 'none',
                  background: currentTheme.accent,
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {isTimerRunning ? '⏸ Pause' : '▶ Start'}
              </button>
              <button
                onClick={resetTimer}
                style={{
                  padding: '1rem 1.5rem',
                  borderRadius: '16px',
                  border: 'none',
                  background: currentTheme.accentLight,
                  color: currentTheme.textPrimary,
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Reset
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  setTimerMode('work');
                  setPomodoroTime(25 * 60);
                  setIsTimerRunning(false);
                }}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: timerMode === 'work' ? currentTheme.accentLight : currentTheme.bgPrimary,
                  color: currentTheme.textPrimary,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
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
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: timerMode === 'break' ? currentTheme.accentLight : currentTheme.bgPrimary,
                  color: currentTheme.textPrimary,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                5 min
              </button>
            </div>
          </div>

          {/* Tasks Card */}
          <div style={{ ...styles.card, gridColumn: window.innerWidth > 768 ? 'span 2' : 'span 1' }} className="card">
            <h2 style={styles.cardTitle}>📋 Today's Tasks</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder="What needs to be done?"
                  style={{
                    flex: 1,
                    padding: '1rem',
                    border: `2px solid rgba(0,0,0,0.1)`,
                    borderRadius: '16px',
                    background: currentTheme.bgPrimary,
                    color: currentTheme.textPrimary,
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={addTask}
                  style={{
                    padding: '1rem 2rem',
                    borderRadius: '16px',
                    border: 'none',
                    background: currentTheme.accent,
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {['high', 'medium', 'low'].map(priority => (
                  <button
                    key={priority}
                    onClick={() => setTaskPriority(priority)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: taskPriority === priority ? priorityColors[priority] : currentTheme.bgPrimary,
                      color: taskPriority === priority ? (priority === 'medium' ? '#000' : '#fff') : currentTheme.textPrimary,
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    {priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'} {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '12px',
                  background: currentTheme.bgPrimary,
                  color: currentTheme.textPrimary,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>🔄 Recurring</span>
                </label>

                {isRecurring && (
                  <select
                    value={recurringType}
                    onChange={(e) => setRecurringType(e.target.value)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: currentTheme.bgPrimary,
                      color: currentTheme.textPrimary,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                )}
              </div>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {sortedTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    background: currentTheme.bgPrimary,
                    borderRadius: '16px',
                    opacity: task.completed ? 0.6 : 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    width: '4px',
                    height: '40px',
                    borderRadius: '4px',
                    background: priorityColors[task.priority]
                  }} />
                  <div
                    onClick={() => toggleTask(task.id)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '8px',
                      border: `2px solid ${currentTheme.accent}`,
                      background: task.completed ? currentTheme.accent : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '14px',
                      flexShrink: 0
                    }}
                  >
                    {task.completed && '✓'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      color: task.completed ? currentTheme.textSecondary : currentTheme.textPrimary,
                      textDecoration: task.completed ? 'line-through' : 'none',
                      display: 'block',
                      wordBreak: 'break-word'
                    }}>
                      {task.text}
                    </span>
                    {task.recurring && (
                      <span style={{ fontSize: '0.75rem', color: currentTheme.textSecondary }}>
                        🔄 {task.recurringType}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: currentTheme.textSecondary,
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      flexShrink: 0
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{
                padding: '1.5rem',
                borderRadius: '16px',
                background: currentTheme.bgPrimary,
                textAlign: 'center'
              }}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: currentTheme.accent
                }}>{stats.total}</div>
                <div style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: currentTheme.textSecondary,
                  marginTop: '0.25rem'
                }}>Total</div>
              </div>
              <div style={{
                padding: '1.5rem',
                borderRadius: '16px',
                background: currentTheme.bgPrimary,
                textAlign: 'center'
              }}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: currentTheme.accent
                }}>{stats.completed}</div>
                <div style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: currentTheme.textSecondary,
                  marginTop: '0.25rem'
                }}>Done</div>
              </div>
              <div style={{
                padding: '1.5rem',
                borderRadius: '16px',
                background: currentTheme.bgPrimary,
                textAlign: 'center'
              }}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: currentTheme.accent
                }}>{stats.progress}%</div>
                <div style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: currentTheme.textSecondary,
                  marginTop: '0.25rem'
                }}>Progress</div>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div style={styles.card} className="card">
            <h2 style={styles.cardTitle}>💭 Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down ideas, reflections..."
              style={{
                width: '100%',
                height: '250px',
                padding: '1rem',
                border: `2px solid rgba(0,0,0,0.1)`,
                borderRadius: '16px',
                background: currentTheme.bgPrimary,
                color: currentTheme.textPrimary,
                fontSize: '1rem',
                lineHeight: '1.6',
                resize: 'vertical',
                outline: 'none',
                fontFamily: "'DM Sans', sans-serif"
              }}
            />
          </div>

          {/* Mood Tracker */}
          <div style={{ ...styles.card, gridColumn: window.innerWidth > 768 ? 'span 2' : 'span 1' }} className="card">
            <h2 style={styles.cardTitle}>🌈 Today's Mood</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
              gap: '1rem'
            }}>
              {moods.map((mood) => (
                <button
                  key={mood.name}
                  onClick={() => setCurrentMood(mood.name)}
                  style={{
                    aspectRatio: '1',
                    border: `2px solid ${currentMood === mood.name ? currentTheme.accent : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '16px',
                    background: currentMood === mood.name ? currentTheme.accentLight : currentTheme.bgPrimary,
                    fontSize: '3rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
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
