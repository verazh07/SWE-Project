import { useState, useEffect } from "react";
import { supabase } from "./SupabaseClient.js";
import { logout, getProgress, updateName, getAchievements } from "./api.js";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Announcements from "./pages/Announcements.jsx";
import Profile from "./pages/Profile.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import * as sample from "./data/sampleData.js";

export default function App() {
  const [user, setUser] = useState(null); // null = not logged in
  const [name, setName] = useState(""); // User's display name from Supabase.
  const [role, setRole] = useState(""); // "student", "professor", or "ta"
  const [page, setPage] = useState("dashboard");
  const [points, setPoints] = useState(0); // Real points from Supabase. Default to 0. Loads after login.
  const [assignments, setAssignments] = useState(sample.assignments);
  const [announcements, setAnnouncements] = useState(sample.announcements);
  const [achievements, setAchievements] = useState([]);

  // Checks whos logged in
  useEffect(function() {
    // Checks if user is already logged in
    async function checkUser(){
      const {data}= await supabase.auth.getSession();
      // If there is a user, pull up saved session
      if (data.session) {
        setUser(data.session.user);
      }
      // Else, no one is logged in. Set to null.
      else {
        setUser(null);
      }
    }
    checkUser();
    // Checks if someone is logging in or out
    function handleChange(event, session) {
      if (session) {
        setUser(session.user);
        }
      // Else, no one is logged in. Set to null.
      else {
        setUser(null);
        }
      }
    const checkStop= supabase.auth.onAuthStateChange(handleChange);
    return function() {
      checkStop.data.subscription.unsubscribe();
    };
  }, []);

    // Whenever the logged-in user changes, load their name and points.
  useEffect(() => {
    if (!user) {
      setName(""); // logged out: clear the name
      setPoints(0);
      return;
    }

    async function loadProgress() {
      const progress = await getProgress();
      if (!progress) return; // couldn't load (check the browser console)
      setName(progress.name);
      setPoints(progress.points);
      setRole(progress.role);
      setAchievements(await getAchievements());
    }

    loadProgress();
  }, [user]); // run again whenever "user" changes

  async function rename(newName) {
    const isError= await updateName(user.id, newName.trim());
    if(isError) {
      return isError;
    }
    setName(newName.trim());
    return null;
  }
  // Check or uncheck an assignment.
  // Finishing on time earns points. Unchecking takes them back.
  function toggleAssignment(id) {
    const item = assignments.find((a) => a.id === id);
    const onTime = item.dueInDays >= 0;

    if (onTime) {
      setPoints(item.done ? points - item.points : points + item.points);
    }
    setAssignments(assignments.map((a) => (a.id === id ? { ...a, done: !a.done } : a)));
  }

  function markRead(id) {
    setAnnouncements(announcements.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllRead() {
    setAnnouncements(announcements.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = announcements.filter((n) => !n.read).length;

// Nobody logged in? Show the login page instead of the app.
if (!user) {
  return <AuthPage />;
}

  return (
    <div className="app">
      <Sidebar page={page} onNavigate={setPage} unreadCount={unreadCount} username={name || user.email} role={role} onLogout={logout} />

      <main className="main">
        {page === "dashboard" && (
          <Dashboard
            student={{...sample.student, name: name || user.email}}
            points={points}
            stages={sample.creatureStages}
            assignments={assignments}
            announcements={announcements}
            onToggle={toggleAssignment}
            onNavigate={setPage}
          />
        )}

        {page === "announcements" && (
          <Announcements
            announcements={announcements}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
          />
        )}

        {page === "profile" && (
          <Profile
            student={sample.student}
            profile={{ ...sample.profile, fullName: name || user.email, email: user.email }}
            onRename={rename}
            points={points}
            stages={sample.creatureStages}
            classes={sample.classes}
            badges={achievements}
          />
        )}
      </main>
    </div>
  );
}
