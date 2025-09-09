import './Features.css'

const Features = () => {
  const features = [
    {
      icon: '⚡',
      title: 'Drop-in Replacement',
      description: 'Replace Google Optimize with a single line of code. No migration headaches, no complex setup.'
    },
    {
      icon: '🎯',
      title: 'Visual Editor',
      description: 'Create experiments without touching code. Our visual editor makes A/B testing accessible to everyone.'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Get instant insights with statistical significance testing and confidence intervals built-in.'
    },
    {
      icon: '🔒',
      title: 'Privacy-First',
      description: 'GDPR compliant by design. Your data stays yours, with enterprise-grade security and privacy controls.'
    },
    {
      icon: '🚀',
      title: 'Lightning Fast',
      description: 'Sub-50ms response times with global CDN. Your experiments load instantly, everywhere.'
    },
    {
      icon: '💰',
      title: 'Transparent Pricing',
      description: 'No hidden fees, no per-seat charges. Pay for what you use with clear, predictable pricing.'
    }
  ]

  return (
    <section id="features" className="features section">
      <div className="container">
        <h2 className="section-title">Why Choose SimpleAB?</h2>
        <p className="section-subtitle">
          Everything you loved about Google Optimize, plus the features you always wished it had.
        </p>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="comparison-section">
          <h3 className="comparison-title">How We Compare</h3>
          <div className="comparison-table">
            <div className="comparison-header">
              <div className="comparison-cell"></div>
              <div className="comparison-cell brand">SimpleAB</div>
              <div className="comparison-cell">Optimizely</div>
              <div className="comparison-cell">ABTasty</div>
            </div>
            
            <div className="comparison-row">
              <div className="comparison-cell feature-name">Setup Time</div>
              <div className="comparison-cell brand">2 minutes</div>
              <div className="comparison-cell">2-4 weeks</div>
              <div className="comparison-cell">1-2 weeks</div>
            </div>
            
            <div className="comparison-row">
              <div className="comparison-cell feature-name">Starting Price</div>
              <div className="comparison-cell brand">$29/month</div>
              <div className="comparison-cell">$2,000/month</div>
              <div className="comparison-cell">$500/month</div>
            </div>
            
            <div className="comparison-row">
              <div className="comparison-cell feature-name">Visual Editor</div>
              <div className="comparison-cell brand">✅</div>
              <div className="comparison-cell">✅</div>
              <div className="comparison-cell">✅</div>
            </div>
            
            <div className="comparison-row">
              <div className="comparison-cell feature-name">Statistical Engine</div>
              <div className="comparison-cell brand">✅</div>
              <div className="comparison-cell">✅</div>
              <div className="comparison-cell">✅</div>
            </div>
            
            <div className="comparison-row">
              <div className="comparison-cell feature-name">No Vendor Lock-in</div>
              <div className="comparison-cell brand">✅</div>
              <div className="comparison-cell">❌</div>
              <div className="comparison-cell">❌</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
