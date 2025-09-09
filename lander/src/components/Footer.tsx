import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <h3>Simple A/B Testing</h3>
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
            <p>&copy; 2025 Simple A/B Testing. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="mailto:hello@simpleabtesting.com">hello@simpleabtesting.com</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
