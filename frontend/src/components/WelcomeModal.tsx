import { useState } from 'react';
import Modal from './Modal';
import { API_URL } from '../config';
import './WelcomeModal.css';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState(false);

  const sdkCode = `<!-- Add this to your website's <head> section -->
<script 
  data-simple-ab="true"
  data-api-key="demo-api-key-123"
  data-api-url="${API_URL}"
  src="${API_URL}/sdk.js">
</script>`;

  const slides = [
    {
      title: 'Welcome to Simple A/B Testing',
      content: 'The easiest way to run experiments on your website without coding. Test different variations of your site and see what works best for your users.',
      icon: '1'
    },
    {
      title: 'Create Experiments Visually',
      content: 'Use our visual editor to select elements on your page and modify them. No coding required - just point, click, and customize. Test button colors, text, images, and more.',
      icon: '2'
    },
    {
      title: 'Track Results in Real-Time',
      content: 'Monitor your experiments with live analytics. See which variations perform best and make data-driven decisions to improve your conversions.',
      icon: '3'
    },
    {
      title: 'Add to Your Website',
      content: 'Copy this script tag and paste it into your website\'s <head> section to start running experiments.',
      icon: '4',
      isScript: true
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sdkCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // On last slide, open visual selector in new tab
      window.open('/visual-selector', '_blank');
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleClose = () => {
    setCurrentSlide(0);
    onClose();
  };

  const slide = slides[currentSlide];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="medium">
      <div className="welcome-modal">
        <div className="welcome-slide">
          <div className="welcome-icon">{slide.icon}</div>
          <h2 className="welcome-title">{slide.title}</h2>
          <p className="welcome-content">{slide.content}</p>
          
          {slide.isScript && (
            <div className="script-container">
              <pre className="script-code">{sdkCode}</pre>
              <button 
                className="btn btn-secondary copy-btn"
                onClick={copyToClipboard}
              >
                {copied ? 'Copied!' : 'Copy Script'}
              </button>
            </div>
          )}
        </div>

        <div className="welcome-progress">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index === currentSlide ? 'active' : ''} ${index < currentSlide ? 'completed' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        <div className="welcome-actions">
          <button
            className="btn btn-secondary"
            onClick={handlePrevious}
            disabled={currentSlide === 0}
            style={{ visibility: currentSlide === 0 ? 'hidden' : 'visible' }}
          >
            Previous
          </button>
          <button className="btn btn-primary" onClick={handleNext}>
            {currentSlide === slides.length - 1 ? "Create Your First Experiment" : 'Next'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

