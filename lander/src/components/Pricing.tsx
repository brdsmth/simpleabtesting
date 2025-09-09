import './Pricing.css'

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: 'per month',
      description: 'Perfect for small websites and startups',
      features: [
        'Up to 10,000 monthly visitors',
        '5 concurrent experiments',
        'Visual editor',
        'Basic analytics',
        'Email support'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Growth',
      price: '$99',
      period: 'per month',
      description: 'Ideal for growing businesses',
      features: [
        'Up to 100,000 monthly visitors',
        'Unlimited experiments',
        'Advanced targeting',
        'Statistical significance',
        'Priority support',
        'Custom integrations'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large organizations',
      features: [
        'Unlimited visitors',
        'White-label solution',
        'Dedicated account manager',
        'SLA guarantee',
        'Custom development',
        'On-premise deployment'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  return (
    <section id="pricing" className="pricing section">
      <div className="container">
        <h2 className="section-title">Simple, Transparent Pricing</h2>
        <p className="section-subtitle">
          No hidden fees, no per-seat charges. Start free and scale as you grow.
        </p>
        
        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              
              <div className="pricing-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="price">{plan.price}</span>
                  <span className="period">/{plan.period}</span>
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>
              
              <ul className="features-list">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="feature-item">
                    <span className="checkmark">✅</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="pricing-footer">
                <a href="#" className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} btn-large pricing-cta`}>
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pricing-faq">
          <h3 className="faq-title">Frequently Asked Questions</h3>
          <div className="faq-grid">
            <div className="faq-item">
              <h4 className="faq-question">Is there a free trial?</h4>
              <p className="faq-answer">Yes! All plans come with a 14-day free trial. No credit card required.</p>
            </div>
            <div className="faq-item">
              <h4 className="faq-question">Can I change plans anytime?</h4>
              <p className="faq-answer">Absolutely. Upgrade or downgrade your plan at any time with prorated billing.</p>
            </div>
            <div className="faq-item">
              <h4 className="faq-question">What happens if I exceed my visitor limit?</h4>
              <p className="faq-answer">We'll notify you before you hit the limit and help you upgrade seamlessly.</p>
            </div>
            <div className="faq-item">
              <h4 className="faq-question">Do you offer refunds?</h4>
              <p className="faq-answer">Yes, we offer a 30-day money-back guarantee on all annual plans.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Pricing
