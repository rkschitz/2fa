import './styles.css';

export default function Footer() {
  return (
    <footer className='footer-container'>
      <div className='footer-content'>
        <p>&copy; {new Date().getFullYear()} :)</p>
        <nav className='footer-nav'>
          <a>SENAC JOINVILLE</a>
        </nav>
      </div>
    </footer>
  );
}
