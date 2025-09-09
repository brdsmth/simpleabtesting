import './Hero.css'

const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              The Simple A/B Testing Platform
              <span className="highlight"> That Actually Works</span>
            </h1>
            <p className="hero-subtitle">
              Replace Google Optimize with a drop-in solution that's easier to use than Optimizely 
              and more affordable than ABTasty. Start testing in minutes, not hours.
            </p>
            <div className="hero-actions">
              <a href="#" className="btn btn-primary btn-large">
                Start Free Trial
              </a>
              <a href="#" className="btn btn-secondary btn-large">
                Watch Demo
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">2 min</div>
                <div className="stat-label">Setup Time</div>
              </div>
              <div className="stat">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div className="stat">
                <div className="stat-number">50%</div>
                <div className="stat-label">Less Cost</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="dashboard-mockup">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="mockup-content">
                <div className="experiment-card">
                  <div className="experiment-status active">Running</div>
                  <h3>Homepage CTA Test</h3>
                  <div className="experiment-metrics">
                    <div className="metric">
                      <span className="metric-label">Conversion Rate</span>
                      <span className="metric-value">+12.5%</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Confidence</span>
                      <span className="metric-value">95%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
