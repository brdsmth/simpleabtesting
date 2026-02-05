import { useState, useEffect, useRef } from 'react';
import '../components/VisualSelector.css';
import { SDK_URL } from '../config';

const RECENT_URLS_KEY = 'simple_ab_recent_urls';
const MAX_RECENT_URLS = 5;

type ConfigStep = 'selected' | 'change-type' | 'change-value' | 'name-experiment' | 'complete';

export default function VisualSelectorPage() {
  const [url, setUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [showUrlOverlay, setShowUrlOverlay] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [corsError, setCorsError] = useState(false);
  const [sdkNotDetected, setSdkNotDetected] = useState(false);
  const [selectedSelector, setSelectedSelector] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const [configStep, setConfigStep] = useState<ConfigStep>('selected');
  const [changeType, setChangeType] = useState<'text' | 'html' | 'style' | 'attribute' | 'class'>('text');
  const [changeValue, setChangeValue] = useState('');
  const [attributeName, setAttributeName] = useState('');
  const [experimentName, setExperimentName] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sdkCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent URLs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_URLS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentUrls(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Failed to parse recent URLs:', e);
      }
    }
  }, []);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'AB_SDK_VISUAL_MODE_READY') {
        // SDK is loaded and visual mode is active
        setSdkNotDetected(false);
        setIsLoading(false);
        if (sdkCheckTimeoutRef.current) {
          clearTimeout(sdkCheckTimeoutRef.current);
          sdkCheckTimeoutRef.current = null;
        }
      } else if (event.data.type === 'AB_SDK_ELEMENT_SELECTED') {
        const selector = event.data.data;
        setSelectedSelector(selector);
        
        // Send the selected selector back to the opener window
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'VISUAL_SELECTOR_RESULT',
            selector: selector
          }, window.location.origin);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (sdkCheckTimeoutRef.current) {
        clearTimeout(sdkCheckTimeoutRef.current);
      }
    };
  }, []);

  const saveToRecentUrls = (urlToSave: string) => {
    // Keep the protocol in the URL
    const cleanUrl = urlToSave;
    
    // Update recent URLs (remove duplicates and limit to MAX_RECENT_URLS)
    const updatedUrls = [cleanUrl, ...recentUrls.filter(u => u !== cleanUrl)].slice(0, MAX_RECENT_URLS);
    setRecentUrls(updatedUrls);
    localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(updatedUrls));
  };

  const handleLoadSite = (urlToLoad?: string) => {
    const targetUrl = urlToLoad || inputUrl;
    if (!targetUrl) return;
    
    // Ensure URL has protocol
    let processedUrl = targetUrl;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      // Check if it's a localhost domain
      const isLocalhost = targetUrl.includes('localhost') || 
                         targetUrl.startsWith('127.0.0.1') || 
                         targetUrl.startsWith('0.0.0.0');
      
      processedUrl = isLocalhost ? 'http://' + targetUrl : 'https://' + targetUrl;
    }
    
    // Save to recent URLs
    saveToRecentUrls(processedUrl);
    
    // Add visual mode parameter
    const urlObj = new URL(processedUrl);
    urlObj.searchParams.set('ab-visual-mode', 'true');
    processedUrl = urlObj.toString();
    
    setUrl(processedUrl);
    setShowUrlOverlay(false);
    setIsLoading(true);
    setIframeLoaded(false);
    setCorsError(false);
    setSdkNotDetected(false);
    
    // Set timeout to check if SDK is detected
    sdkCheckTimeoutRef.current = setTimeout(() => {
      setSdkNotDetected(true);
      setIsLoading(false);
    }, 5000); // Wait 5 seconds for SDK to respond
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    // Don't set loading to false yet - wait for SDK to respond
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setCorsError(true);
  };

  const copyBookmarklet = () => {
    const bookmarkletCode = `javascript:(function(){if(document.getElementById('ab-selector-popup')){alert('Selector already running!');return}var s=document.createElement('style');s.textContent='.ab-selector-highlight{outline:3px solid #3ecf8e!important;outline-offset:2px!important;cursor:pointer!important;position:relative!important}.ab-selector-tooltip{position:fixed!important;background:#1e293b!important;color:white!important;padding:8px 14px!important;border-radius:8px!important;font-size:13px!important;font-family:Monaco,Consolas,monospace!important;pointer-events:none!important;z-index:999999!important;box-shadow:0 4px 16px rgba(0,0,0,.4)!important;font-weight:600!important}.ab-selector-overlay{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;background:rgba(0,0,0,.15)!important;z-index:999998!important;cursor:crosshair!important}.ab-selector-popup{position:fixed!important;top:50%!important;left:50%!important;transform:translate(-50%,-50%)!important;background:white!important;padding:24px!important;border-radius:12px!important;box-shadow:0 20px 60px rgba(0,0,0,.3)!important;z-index:9999999!important;min-width:400px!important;max-width:90vw!important;font-family:system-ui,-apple-system,sans-serif!important}.ab-selector-popup h3{margin:0 0 16px 0!important;color:#1e293b!important;font-size:18px!important;font-weight:700!important}.ab-selector-popup input{width:100%!important;padding:12px!important;border:2px solid #3ecf8e!important;border-radius:8px!important;font-family:Monaco,Consolas,monospace!important;font-size:14px!important;margin-bottom:16px!important;box-sizing:border-box!important}.ab-selector-popup-buttons{display:flex!important;gap:8px!important;justify-content:flex-end!important}.ab-selector-popup button{padding:10px 20px!important;border:none!important;border-radius:8px!important;font-weight:600!important;cursor:pointer!important;font-size:14px!important}.ab-selector-copy-btn{background:#3ecf8e!important;color:#1e293b!important}.ab-selector-close-btn{background:#e2e8f0!important;color:#1e293b!important}.ab-selector-banner{position:fixed!important;top:20px!important;left:50%!important;transform:translateX(-50%)!important;background:#3ecf8e!important;color:#1e293b!important;padding:12px 24px!important;border-radius:10px!important;font-weight:700!important;font-size:15px!important;box-shadow:0 8px 24px rgba(62,207,142,.4)!important;z-index:999999!important;font-family:system-ui!important}';document.head.appendChild(s);var banner=document.createElement('div');banner.className='ab-selector-banner';banner.textContent='Hover and click to select an element';document.body.appendChild(banner);var o=document.createElement('div');o.className='ab-selector-overlay';document.body.appendChild(o);var t=document.createElement('div');t.className='ab-selector-tooltip';t.style.display='none';document.body.appendChild(t);var c=null;function generateSelector(e){if(e.id)return'#'+e.id;if(e.className&&typeof e.className==='string'){var classes=e.className.split(' ').filter(c=>c&&!c.startsWith('ab-selector'));if(classes.length>0)return'.'+classes.join('.')}var parent=e.parentElement;if(!parent)return e.tagName.toLowerCase();var siblings=Array.from(parent.children).filter(child=>child.tagName===e.tagName);if(siblings.length===1)return e.tagName.toLowerCase();var index=siblings.indexOf(e)+1;return e.tagName.toLowerCase()+':nth-child('+index+')'}function showPopup(selector){o.remove();t.remove();banner.remove();if(c)c.classList.remove('ab-selector-highlight');var popup=document.createElement('div');popup.id='ab-selector-popup';popup.className='ab-selector-popup';popup.innerHTML='<h3>Element Selected!</h3><input type="text" id="ab-selector-input" value="'+selector+'" readonly><div class="ab-selector-popup-buttons"><button class="ab-selector-close-btn" onclick="this.parentElement.parentElement.remove()">Close</button><button class="ab-selector-copy-btn" onclick="var inp=document.getElementById(\\'ab-selector-input\\');inp.select();document.execCommand(\\'copy\\');this.textContent=\\'Copied!\\';setTimeout(()=>this.textContent=\\'Copy\\',1500)">Copy</button></div>';document.body.appendChild(popup);document.getElementById('ab-selector-input').select()}o.addEventListener('mousemove',function(e){var target=e.target;if(target===o||target===t||target===banner)return;if(c)c.classList.remove('ab-selector-highlight');c=target;target.classList.add('ab-selector-highlight');var selector=generateSelector(target);t.textContent=selector;t.style.display='block';t.style.left=e.clientX+10+'px';t.style.top=e.clientY+10+'px'});o.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var target=e.target;if(target===o||target===t||target===banner)return;var selector=generateSelector(target);showPopup(selector)})})();`;
    
    navigator.clipboard.writeText(bookmarkletCode);
    alert('Bookmarklet copied to clipboard!\n\nNext steps:\n1. Create a new bookmark\n2. Edit the bookmark and paste as the URL\n3. Go to your website\n4. Click the bookmarklet to start selecting');
  };

  const handleClose = () => {
    window.close();
  };

  const handleCreateExperiment = () => {
    console.log('Creating experiment', { 
      experimentName,
      selectedSelector,
      changeType,
      changeValue,
      attributeName
    });
    
    if (window.opener && !window.opener.closed) {
      // Send complete experiment configuration
      window.opener.postMessage({
        type: 'VISUAL_SELECTOR_COMPLETE',
        experiment: {
          name: experimentName,
          selector: selectedSelector,
          changeType,
          changeValue,
          attributeName: changeType === 'attribute' ? attributeName : undefined
        }
      }, window.location.origin);
      
      setConfigStep('complete');
      
      // Close after showing success
      setTimeout(() => {
        window.close();
      }, 2000);
    } else {
      console.error('Cannot send experiment data');
      alert('Unable to send data back to parent window.');
    }
  };

  const handleNextStep = () => {
    if (configStep === 'selected') {
      setConfigStep('change-type');
    } else if (configStep === 'change-type') {
      setConfigStep('change-value');
    } else if (configStep === 'change-value') {
      setConfigStep('name-experiment');
    } else if (configStep === 'name-experiment') {
      handleCreateExperiment();
    }
  };

  const handleBackStep = () => {
    if (configStep === 'change-type') {
      setConfigStep('selected');
    } else if (configStep === 'change-value') {
      setConfigStep('change-type');
    } else if (configStep === 'name-experiment') {
      setConfigStep('change-value');
    }
  };

  const canProceed = () => {
    if (configStep === 'change-type') return true;
    if (configStep === 'change-value') {
      if (changeType === 'attribute') {
        return changeValue.trim() && attributeName.trim();
      }
      return changeValue.trim();
    }
    if (configStep === 'name-experiment') return experimentName.trim();
    return false;
  };

  return (
    <div style={{ 
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-secondary)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* URL Input Overlay */}
      {showUrlOverlay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            padding: '3rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            maxWidth: '600px',
            width: '90%'
          }}>
            <h2 style={{ 
              margin: '0 0 1rem 0',
              fontSize: '1.75rem',
              color: 'var(--text-primary)'
            }}>
              Enter Website URL
            </h2>
            <p style={{
              margin: '0 0 2rem 0',
              color: 'var(--text-secondary)',
              fontSize: '0.9375rem',
              lineHeight: '1.6'
            }}>
              Enter the URL of the website where you want to select elements. Make sure the Simple AB Testing SDK is installed on your site.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLoadSite()}
                placeholder="https://example.com"
                autoFocus
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1rem',
                  border: '2px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
              />
            </div>
            
            {recentUrls.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Recent URLs
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {recentUrls.map((recentUrl, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputUrl(recentUrl);
                        handleLoadSite(recentUrl);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9375rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                      }}
                    >
                      <svg
                        style={{
                          width: '16px',
                          height: '16px',
                          marginRight: '0.75rem',
                          flexShrink: 0,
                          color: 'var(--text-tertiary)'
                        }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {recentUrl}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button 
                className="btn btn-secondary"
                onClick={handleClose}
                style={{ minWidth: '100px' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleLoadSite()}
                disabled={!inputUrl}
                style={{ minWidth: '100px' }}
              >
                Load Site
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="visual-selector-content" style={{ 
        margin: 0, 
        width: '100%', 
        height: '100%', 
        maxWidth: 'none',
        borderRadius: 0,
        border: 'none',
        background: 'var(--bg-primary)'
      }}>
        <div className="visual-selector-header" style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-primary)',
          background: 'var(--bg-secondary)',
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <h2 style={{ margin: 0, flexShrink: 0 }}>Simple A/B Testing</h2>
          
          {url && (
            <div style={{ 
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask AI to help you find and modify elements..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    paddingLeft: '2.5rem',
                    fontSize: '0.9375rem',
                    border: '2px solid var(--border-primary)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && aiQuery.trim()) {
                      // TODO: Connect to AI model
                      console.log('AI Query:', aiQuery);
                      alert('AI integration coming soon! Query: ' + aiQuery);
                    }
                  }}
                />
                <svg
                  style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '18px',
                    height: '18px',
                    color: 'var(--text-tertiary)'
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: 'auto', flexShrink: 0 }}>
            {url && (
              <button 
                className="btn btn-secondary"
                onClick={() => setShowUrlOverlay(true)}
                style={{ fontSize: '0.875rem' }}
              >
                Change URL
              </button>
            )}
            <button className="close-btn" onClick={handleClose}>×</button>
          </div>
        </div>

        <div className="visual-selector-body" style={{
          padding: 0,
          height: 'calc(100% - 73px)' // Subtract header height
        }}>
          <div className="url-input-section" style={{ display: url ? 'none' : 'block' }}>
            <div className="form-group">
              <label>Enter your website URL</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLoadSite()}
                  placeholder="https://example.com"
                  style={{ flex: 1 }}
                />
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleLoadSite()}
                  disabled={!inputUrl || isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load Site'}
                </button>
              </div>
            </div>

            {sdkNotDetected && !corsError && (
              <div className="cors-error-message">
                <h4>SDK Not Detected</h4>
                <p>
                  The Simple AB Testing SDK was not found on your website. The visual selector requires the SDK to be installed.
                </p>
                <h5 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Installation Instructions:</h5>
                <ol>
                  <li>Add the SDK script to your website's <code>&lt;head&gt;</code> tag:
                    <pre style={{ 
                      background: 'var(--bg-tertiary)', 
                      padding: '0.75rem', 
                      borderRadius: 'var(--radius-md)', 
                      marginTop: '0.5rem',
                      overflow: 'auto'
                    }}>
{`<script src="${SDK_URL}"
  data-simple-ab
  data-api-key="YOUR_API_KEY">
</script>`}
                    </pre>
                  </li>
                  <li>Reload your website</li>
                  <li>Come back here and try loading your site again</li>
                </ol>
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                  Alternatively, you can use the bookmarklet method which doesn't require SDK installation:
                </p>
                <button className="btn btn-secondary" onClick={copyBookmarklet} style={{ marginTop: '0.5rem' }}>
                  Copy Bookmarklet (Alternative Method)
                </button>
              </div>
            )}

            {corsError && (
              <div className="cors-error-message">
                <h4>CORS Restriction Detected</h4>
                <p>
                  This website cannot be loaded in an iframe due to security restrictions.
                  Use the bookmarklet method instead:
                </p>
                <ol>
                  <li>Click "Copy Bookmarklet" below</li>
                  <li>Create a new bookmark in your browser</li>
                  <li>Paste the copied code as the bookmark URL</li>
                  <li>Navigate to your site and click the bookmarklet</li>
                  <li>Click on any element to get its selector</li>
                </ol>
                <button className="btn btn-secondary" onClick={copyBookmarklet}>
                  Copy Bookmarklet
                </button>
              </div>
            )}
          </div>

          {url && !corsError && !sdkNotDetected && (
            <div className="iframe-container" style={{
              height: '100%',
              border: 'none',
              borderRadius: 0
            }}>
              {isLoading && (
                <div className="loading-overlay">
                  <div className="loading-spinner"></div>
                  <p>Loading website and detecting SDK...</p>
                </div>
              )}
              
              {iframeLoaded && !isLoading && (
                <div className="instructions-banner">
                  <span>Hover over elements and click to select</span>
                </div>
              )}

              <iframe
                ref={iframeRef}
                src={url}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                sandbox="allow-same-origin allow-scripts"
                title="Website Preview"
              />
            </div>
          )}

          {selectedSelector && (
            <div className="selection-card"
              style={{
                position: 'fixed',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-primary)',
                padding: '2rem',
                zIndex: 1000,
                minWidth: '480px',
                maxWidth: '90vw',
                animation: 'slideUp 0.3s ease-out'
              }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: configStep === 'complete' ? 'var(--success-bg)' : 'var(--primary-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {configStep === 'complete' ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    )}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.25rem'
                    }}>
                      {configStep === 'selected' && 'Element Selected'}
                      {configStep === 'change-type' && 'Step 1 of 3'}
                      {configStep === 'change-value' && 'Step 2 of 3'}
                      {configStep === 'name-experiment' && 'Step 3 of 3'}
                      {configStep === 'complete' && 'Experiment Created'}
                    </div>
                    <div style={{
                      fontSize: '1.25rem',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      lineHeight: 1.3
                    }}>
                      {configStep === 'selected' && 'Ready to configure'}
                      {configStep === 'change-type' && 'What do you want to change?'}
                      {configStep === 'change-value' && 'What should it say?'}
                      {configStep === 'name-experiment' && 'Name your experiment'}
                      {configStep === 'complete' && 'Success!'}
                    </div>
                  </div>
                </div>
                {configStep !== 'complete' && (
                  <button
                    onClick={() => setSelectedSelector('')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-tertiary)',
                      cursor: 'pointer',
                      fontSize: '1.5rem',
                      padding: '0.5rem',
                      lineHeight: 1,
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    ×
                  </button>
                )}
              </div>
              
              {/* Step content */}
              <div style={{ marginBottom: '1.5rem' }}>
                {configStep === 'selected' && (
                  <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    border: '1px solid var(--border-primary)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        flex: 1,
                        minWidth: 0
                      }}>
                        <span style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          fontWeight: 500,
                          flexShrink: 0
                        }}>
                          Selector:
                        </span>
                        <code style={{
                          fontSize: '0.875rem',
                          color: 'var(--brand-green-dark)',
                          fontWeight: 600,
                          background: 'var(--bg-primary)',
                          padding: '0.375rem 0.625rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {selectedSelector}
                        </code>
                      </div>
                    </div>
                  </div>
                )}

                {configStep === 'change-type' && (
                  <div>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9375rem',
                      marginBottom: '1rem',
                      lineHeight: 1.5
                    }}>
                      Select what type of change you'd like to make to this element:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { value: 'text', label: 'Change Text', desc: 'Modify the text content' },
                        { value: 'html', label: 'Change HTML', desc: 'Modify the HTML content' },
                        { value: 'style', label: 'Change Style', desc: 'Modify CSS properties' },
                        { value: 'attribute', label: 'Change Attribute', desc: 'Modify element attributes' },
                        { value: 'class', label: 'Toggle Class', desc: 'Add or remove CSS classes' }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => setChangeType(option.value as any)}
                          style={{
                            background: changeType === option.value ? 'var(--primary-bg)' : 'var(--bg-secondary)',
                            border: changeType === option.value ? '2px solid var(--primary)' : '1px solid var(--border-primary)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (changeType !== option.value) {
                              e.currentTarget.style.borderColor = 'var(--primary)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (changeType !== option.value) {
                              e.currentTarget.style.borderColor = 'var(--border-primary)';
                            }
                          }}
                        >
                          <div style={{
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '0.25rem'
                          }}>
                            {option.label}
                          </div>
                          <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)'
                          }}>
                            {option.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {configStep === 'change-value' && (
                  <div>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9375rem',
                      marginBottom: '1rem',
                      lineHeight: 1.5
                    }}>
                      {changeType === 'text' && 'Enter the new text for the variation:'}
                      {changeType === 'html' && 'Enter the new HTML content:'}
                      {changeType === 'style' && 'Enter CSS styles (e.g., color: red; font-size: 20px;):'}
                      {changeType === 'attribute' && 'Enter the attribute name and value:'}
                      {changeType === 'class' && 'Enter the class name to toggle:'}
                    </p>
                    
                    {changeType === 'attribute' && (
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          marginBottom: '0.5rem'
                        }}>
                          Attribute Name
                        </label>
                        <input
                          type="text"
                          value={attributeName}
                          onChange={(e) => setAttributeName(e.target.value)}
                          placeholder="e.g., href, src, alt"
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            fontSize: '1rem',
                            border: '1px solid var(--border-primary)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontFamily: 'monospace'
                          }}
                        />
                      </div>
                    )}
                    
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem'
                    }}>
                      {changeType === 'attribute' ? 'Attribute Value' : 'New Value'}
                    </label>
                    <textarea
                      value={changeValue}
                      onChange={(e) => setChangeValue(e.target.value)}
                      placeholder={
                        changeType === 'text' ? 'Enter new text...' :
                        changeType === 'html' ? 'Enter new HTML...' :
                        changeType === 'style' ? 'color: blue; font-weight: bold;' :
                        changeType === 'class' ? 'active' :
                        'Enter value...'
                      }
                      rows={changeType === 'style' || changeType === 'html' ? 4 : 2}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontFamily: changeType === 'text' ? 'inherit' : 'monospace',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                )}

                {configStep === 'name-experiment' && (
                  <div>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9375rem',
                      marginBottom: '1rem',
                      lineHeight: 1.5
                    }}>
                      Give your experiment a descriptive name:
                    </p>
                    <input
                      type="text"
                      value={experimentName}
                      onChange={(e) => setExperimentName(e.target.value)}
                      placeholder="e.g., Homepage Hero Text Test"
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && experimentName.trim()) {
                          handleNextStep();
                        }
                      }}
                    />
                    
                    <div style={{
                      marginTop: '1.5rem',
                      padding: '1rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-primary)'
                    }}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '0.75rem'
                      }}>
                        Experiment Summary
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6
                      }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Element:</strong>{' '}
                          <code style={{
                            background: 'var(--bg-primary)',
                            padding: '0.125rem 0.375rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8125rem'
                          }}>
                            {selectedSelector}
                          </code>
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Change Type:</strong>{' '}
                          {changeType}
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>New Value:</strong>{' '}
                          <code style={{
                            background: 'var(--bg-primary)',
                            padding: '0.125rem 0.375rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8125rem'
                          }}>
                            {changeValue.substring(0, 50)}{changeValue.length > 50 ? '...' : ''}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {configStep === 'complete' && (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem 0'
                  }}>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '1rem',
                      lineHeight: 1.5
                    }}>
                      Your experiment has been created successfully! This window will close automatically.
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {configStep !== 'complete' && (
                <div style={{
                  display: 'flex',
                  gap: '0.75rem'
                }}>
                  {configStep !== 'selected' && (
                    <button
                      className="btn btn-secondary"
                      onClick={handleBackStep}
                      style={{
                        flex: 1,
                        padding: '0.875rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 600
                      }}
                    >
                      Back
                    </button>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={handleNextStep}
                    disabled={configStep !== 'selected' && !canProceed()}
                    style={{
                      flex: 2,
                      padding: '0.875rem 1.5rem',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: 'var(--shadow-green)',
                      transition: 'all 0.2s ease',
                      opacity: (configStep !== 'selected' && !canProceed()) ? 0.5 : 1,
                      cursor: (configStep !== 'selected' && !canProceed()) ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (configStep === 'selected' || canProceed()) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 12px 20px -6px rgba(62, 207, 142, 0.35)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-green)';
                    }}
                  >
                    {configStep === 'selected' && 'Start Configuration'}
                    {configStep === 'change-type' && 'Next'}
                    {configStep === 'change-value' && 'Next'}
                    {configStep === 'name-experiment' && 'Create Experiment'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

