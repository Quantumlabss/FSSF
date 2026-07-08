import { NavLink } from 'react-router-dom';
import { Container, Nav, Navbar as BsNavbar, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/tactics', label: 'Tactics' },
  { to: '/events', label: 'Events' },
  { to: '/roster', label: 'Roster' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/aars', label: 'AARs' },
  { to: '/apply', label: 'Apply' },
];

export default function Navbar() {
  const { user, login, logout, hasRole } = useAuth();

  return (
    <BsNavbar expand="lg" className="fssf-navbar" variant="dark" sticky="top">
      <Container>
        <BsNavbar.Brand as={NavLink} to="/">FSSF</BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="fssf-nav" />
        <BsNavbar.Collapse id="fssf-nav">
          <Nav className="me-auto">
            {NAV_LINKS.map((l) => (
              <Nav.Link key={l.to} as={NavLink} to={l.to} end={l.end}>
                {l.label}
              </Nav.Link>
            ))}
            {hasRole('nco') && (
              <Nav.Link as={NavLink} to="/admin">Command</Nav.Link>
            )}
          </Nav>
          <Nav>
            {user ? (
              <NavDropdown
                align="end"
                title={
                  <span className="fssf-mono">
                    <img
                      src={user.avatarUrl}
                      alt=""
                      width={22}
                      height={22}
                      style={{ borderRadius: '50%', marginRight: 8 }}
                    />
                    {user.callsign || user.username}
                  </span>
                }
              >
                <NavDropdown.Item as={NavLink} to="/apply">My Applications</NavDropdown.Item>
                {hasRole('nco') && <NavDropdown.Item as={NavLink} to="/admin">Command Dashboard</NavDropdown.Item>}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout}>Log out</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <button className="btn btn-fssf btn-sm" onClick={login}>
                Login with Discord
              </button>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}
