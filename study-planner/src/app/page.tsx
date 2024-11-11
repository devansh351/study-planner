'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, RotateCw, Plus, Trash2, LogIn, LogOut, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const StudyPlanner = () => {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
  });

  // Student Info
  const [studentName, setStudentName] = useState('');
  
  // Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    startDate: '',
    targetDate: '',
    workingDaysPerWeek: 6,
  });

  // Subjects State
  const [subjects, setSubjects] = useState([
    { name: 'Advanced Accounting', totalLectures: 50, lecturesCompleted: 0, hoursPerLecture: 1.5 },
    { name: 'Auditing', totalLectures: 40, lecturesCompleted: 0, hoursPerLecture: 1.5 },
    { name: 'Law', totalLectures: 45, lecturesCompleted: 0, hoursPerLecture: 1.5 },
    { name: 'Cost Accounting', totalLectures: 35, lecturesCompleted: 0, hoursPerLecture: 1.5 },
  ]);

  // Quick Update Mode
  const [quickUpdate, setQuickUpdate] = useState({
    selectedSubject: 0,
    showCounter: false
  });

  const quotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The difference between try and triumph is just a little umph!",
    "The only way to do great work is to love what you do.",
    "Your time as a CA student is your greatest investment.",
    "Small progress is still progress.",
    "The expert in anything was once a beginner.",
    "Success is built one page at a time.",
    "Your future self will thank you for studying today.",
  ];

  const [selectedQuote, setSelectedQuote] = useState('');
  const [report, setReport] = useState({
    totalPendingLectures: 0,
    totalPendingHours: 0,
    requiredHoursPerDay: 0,
    remarks: '',
    totalProgress: 0
  });

const calculateMetrics = () => {
  // Calculate total pending lectures
  const totalPendingLectures = subjects.reduce((acc, subject) => {
    return acc + (subject.totalLectures - subject.lecturesCompleted);
  }, 0);

  // Calculate total pending hours
  const totalPendingHours = subjects.reduce((acc, subject) => {
    return acc + ((subject.totalLectures - subject.lecturesCompleted) * subject.hoursPerLecture);
  }, 0);

  // Calculate required hours per day
  let requiredHoursPerDay = 0;
  if (basicInfo.startDate && basicInfo.targetDate) {
    const startDate = new Date(basicInfo.startDate);
    const targetDate = new Date(basicInfo.targetDate);
    const totalDays = Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalWorkingDays = Math.ceil((totalDays / 7) * basicInfo.workingDaysPerWeek);
    
    if (totalWorkingDays > 0) {
      requiredHoursPerDay = totalPendingHours / totalWorkingDays;
    }
  }

  return {
    totalPendingLectures,
    totalPendingHours,
    requiredHoursPerDay
  };
};

  // Auth Functions
  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          authForm.email,
          authForm.password
        );
        setUser(userCredential.user);
        setIsLoggedIn(true);
        // Initialize user data
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          studentName: '',
          basicInfo,
          subjects,
        });
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          authForm.email,
          authForm.password
        );
        setUser(userCredential.user);
        setIsLoggedIn(true);
        // Load user data
        const userData = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userData.exists()) {
          const data = userData.data();
          setStudentName(data.studentName || '');
          setBasicInfo(data.basicInfo || basicInfo);
          setSubjects(data.subjects || subjects);
        }
      }
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsLoggedIn(false);
      // Reset to default state
      setStudentName('');
      setBasicInfo({
        startDate: '',
        targetDate: '',
        workingDaysPerWeek: 6,
      });
      setSubjects([
        { name: 'Advanced Accounting', totalLectures: 50, lecturesCompleted: 0, hoursPerLecture: 1.5 },
        { name: 'Auditing', totalLectures: 40, lecturesCompleted: 0, hoursPerLecture: 1.5 },
        { name: 'Law', totalLectures: 45, lecturesCompleted: 0, hoursPerLecture: 1.5 },
        { name: 'Cost Accounting', totalLectures: 35, lecturesCompleted: 0, hoursPerLecture: 1.5 },
      ]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const saveProgress = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        studentName,
        basicInfo,
        subjects,
      });
      alert('Progress saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving progress');
    }
  };

  const refreshQuote = () => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setSelectedQuote(randomQuote);
  };

  const updateLectureCount = (increment) => {
    const subjectIndex = quickUpdate.selectedSubject;
    const updatedSubjects = [...subjects];
    const newCount = updatedSubjects[subjectIndex].lecturesCompleted + increment;
    
    if (newCount >= 0 && newCount <= updatedSubjects[subjectIndex].totalLectures) {
      updatedSubjects[subjectIndex].lecturesCompleted = newCount;
      setSubjects(updatedSubjects);
    }
  };

  const calculateTotalProgress = () => {
    const totalLectures = subjects.reduce((acc, subject) => acc + subject.totalLectures, 0);
    const completedLectures = subjects.reduce((acc, subject) => acc + subject.lecturesCompleted, 0);
    return totalLectures ? (completedLectures / totalLectures) * 100 : 0;
  };

  useEffect(() => {
    refreshQuote();
    const progress = calculateTotalProgress();
    const metrics = calculateMetrics();
    setReport(prev => ({
      ...prev,
      ...metrics,
      totalProgress: progress
    }));
  }, [subjects, basicInfo.startDate, basicInfo.targetDate, basicInfo.workingDaysPerWeek]);

  // Auth Form UI
  const renderAuthForm = () => (
    <div className="max-w-md mx-auto mt-8 border rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-2xl font-semibold">{authMode === 'login' ? 'Login' : 'Register'}</h2>
        <p className="text-gray-500 mt-2">
          {authMode === 'login' 
            ? 'Login to access your study plan' 
            : 'Create a new account to start tracking your progress'}
        </p>
      </div>
      <div className="p-6 pt-0">
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
              required
            />
          </div>
          {authError && <p className="text-red-500 text-sm">{authError}</p>}
          <Button type="submit" className="w-full">
            {authMode === 'login' ? 'Login' : 'Register'}
          </Button>
          <p className="text-center text-sm">
            {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="text-blue-500 hover:underline"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            >
              {authMode === 'login' ? 'Register' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );

  const renderMainContent = () => (
    <div className="space-y-8">
      {/* Learning Report */}
      <div className="border rounded-lg shadow-sm bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="p-6">
          <h2 className="text-2xl font-semibold">Learning Report</h2>
        </div>
        <div className="p-6 pt-0 space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Overall Progress</span>
              <span>{report.totalProgress.toFixed(1)}%</span>
            </div>
            <Progress value={report.totalProgress} className="h-2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-gray-600">Pending Lectures</div>
              <div className="text-2xl font-bold">{report.totalPendingLectures}</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-gray-600">Pending Hours</div>
              <div className="text-2xl font-bold">{report.totalPendingHours.toFixed(1)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-gray-600">Hours/Day Required</div>
              <div className="text-2xl font-bold text-blue-600">
                {report.requiredHoursPerDay.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Quick Update Section */}
          <div className="border rounded-lg shadow-sm bg-white">
            <div className="p-6">
              <h3 className="text-lg font-semibold">Quick Lecture Update</h3>
              <p className="text-gray-500 mt-1">Update your progress for today</p>
            </div>
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1"
                    value={quickUpdate.selectedSubject}
                    onChange={(e) => setQuickUpdate(prev => ({...prev, selectedSubject: parseInt(e.target.value)}))}
                  >
                    {subjects.map((subject, idx) => (
                      <option key={idx} value={idx}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateLectureCount(-1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="text-xl font-bold w-20 text-center">
                    {subjects[quickUpdate.selectedSubject].lecturesCompleted}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateLectureCount(1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-center text-sm text-gray-600">
                  of {subjects[quickUpdate.selectedSubject].totalLectures} lectures
                </div>
              </div>
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="bg-white p-4 rounded-lg flex items-center justify-between">
            <div className="italic text-gray-600">"{selectedQuote}"</div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshQuote}
              className="ml-2"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

const renderInputSection = () => (
      <div className="border rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-2xl font-semibold">Setup & Configuration</h2>
        </div>
        <div className="space-y-6">
          {/* Student Info */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Student Name</label>
            <Input
              placeholder="Enter your name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input
                type="date"
                value={basicInfo.startDate}
                onChange={(e) => setBasicInfo({...basicInfo, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Date</label>
              <Input
                type="date"
                value={basicInfo.targetDate}
                onChange={(e) => setBasicInfo({...basicInfo, targetDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Working Days/Week</label>
              <Input
                type="number"
                min="1"
                max="7"
                value={basicInfo.workingDaysPerWeek}
                onChange={(e) => setBasicInfo({...basicInfo, workingDaysPerWeek: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <Separator />

          {/* Subjects Table */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Subjects Configuration</h3>
              <Button onClick={() => setSubjects([...subjects, {
                name: 'New Subject',
                totalLectures: 0,
                lecturesCompleted: 0,
                hoursPerLecture: 1.5
              }])}>
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </Button>
            </div>
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 px-2">
                <div className="col-span-3">Subject Name</div>
                <div className="col-span-3">Total Lectures</div>
                <div className="col-span-3">Hours per Lecture</div>
                <div className="col-span-3">Actions</div>
              </div>
              {/* Table Body */}
              {subjects.map((subject, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-2 rounded-lg">
                  <div className="col-span-3">
                    <Input
                      value={subject.name}
                      onChange={(e) => {
                        const updated = [...subjects];
                        updated[index].name = e.target.value;
                        setSubjects(updated);
                      }}
                      placeholder="Subject Name"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      value={subject.totalLectures}
                      onChange={(e) => {
                        const updated = [...subjects];
                        updated[index].totalLectures = parseInt(e.target.value);
                        setSubjects(updated);
                      }}
                      placeholder="Total Lectures"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      step="0.5"
                      value={subject.hoursPerLecture}
                      onChange={(e) => {
                        const updated = [...subjects];
                        updated[index].hoursPerLecture = parseFloat(e.target.value);
                        setSubjects(updated);
                      }}
                      placeholder="Hours per Lecture"
                    />
                  </div>
                  <div className="col-span-3">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        const updated = subjects.filter((_, i) => i !== index);
                        setSubjects(updated);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header - Always visible */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          CA Study Planner
        </h1>
        <p className="text-sm text-gray-500">Made by Devansh with the help of AI</p>
      </div>

      {!isLoggedIn ? (
        // Show login form when not logged in
        renderAuthForm()
      ) : (
        // Show main content when logged in
        <div className="space-y-8">
          {/* Logged-in user header */}
          {studentName && (
            <p className="text-lg text-gray-600 text-center">Welcome, {studentName}</p>
          )}
          
          {/* Auth Header */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={saveProgress}>
              <Save className="w-4 h-4 mr-2" />
              Save Progress
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Main Content */}
          {renderMainContent()}
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;