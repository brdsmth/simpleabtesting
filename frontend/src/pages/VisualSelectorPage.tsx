import { useState, useEffect, useRef } from 'react';
import '../components/VisualSelector.css';

export default function VisualSelectorPage() {
  const [url, setUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [showUrlOverlay, setShowUrlOverlay] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [corsError, setCorsError] = useState(false);
  const [sdkNotDetected, setSdkNotDetected] = useState(false);
  const [selectedSelector, setSelectedSelector] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sdkCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleLoadSite = (urlToLoad?: string) => {
    const targetUrl = urlToLoad || inputUrl;
    if (!targetUrl) return;
    
    // Ensure URL has protocol
    let processedUrl = targetUrl;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      processedUrl = 'https://' + targetUrl;
    }
    
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

  const handleUseSelector = () => {
    console.log('Use Selector clicked', { 
      selectedSelector, 
      hasOpener: !!window.opener, 
      openerClosed: window.opener?.closed 
    });
    
    if (selectedSelector && window.opener && !window.opener.closed) {
      console.log('Sending message to opener:', selectedSelector);
      window.opener.postMessage({
        type: 'VISUAL_SELECTOR_RESULT',
        selector: selectedSelector
      }, window.location.origin);
      
      // Close after a small delay to ensure message is sent
      setTimeout(() => {
        window.close();
      }, 100);
    } else {
      console.error('Cannot send selector:', {
        noSelector: !selectedSelector,
        noOpener: !window.opener,
        openerClosed: window.opener?.closed
      });
      alert('Unable to send selector back to parent window. Please copy the selector manually: ' + selectedSelector);
    }
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
          borderRadius: 0
        }}>
          <h2>Simple A/B Testing</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
{`<script src="YOUR_CDN_URL/simple-ab-testing.js"
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
            <div className="selected-selector-display">
              <strong>Selected:</strong> <code>{selectedSelector}</code>
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleUseSelector}
              >
                Use This Selector
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

