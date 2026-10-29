// The navigation menu. On phones the CSS turns it into a bar along the top.
const links = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "announcements", label: "Announcements", icon: "✉" },
  { id: "profile", label: "Profile", icon: "◉" },
];

export default function Sidebar({ page, onNavigate, unreadCount, username, role, onLogout }) {
  return (
    <nav className="sidebar">
      <div className="brand">TimeQuest</div>

      <ul className="nav-list">
        {links.map((link) => (
          <li key={link.id}>
            <button
              className={page === link.id ? "nav-link active" : "nav-link"}
              onClick={() => onNavigate(link.id)}
            >
              <span className="nav-icon" aria-hidden="true">{link.icon}</span>
              {link.label}
              {link.id === "announcements" && unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar-user">
        <div className="sidebar-who">
          <span className="sidebar-username">{username}</span>
          {role && <span className="sidebar-role">{role}</span>}
        </div>
        <button className="btn-link" onClick={onLogout}>Log out</button>
      </div>
    </nav>
  );
}
