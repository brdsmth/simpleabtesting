import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <h3>SimpleAB</h3>
              <p>The simple A/B testing platform that actually works.</p>
            </div>
            <div className="social-links">
              <span className="social-placeholder">🐦</span>
              <span className="social-placeholder">💼</span>
              <span className="social-placeholder">👨‍💻</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 SimpleAB. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="mailto:hello@simpleabtesting.com">hello@simpleabtesting.com</a>
              <span className="separator">|</span>
              <a href="tel:+1-555-0123">+1 (555) 012-3456</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
