import React, { useState } from 'react';
import './App.css';

function App() {
  const [lang, setLang] = useState('en');
  const [crop, setCrop] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (crop && quantity && location) {
      setShowResults(true);
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="nav-brand">
          <svg className="brand-icon" viewBox="0 0 24 24" width="28" height="28" fill="#1B5E20">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <span className="brand-name">SMART<span>Mandi</span></span>
        </div>
        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#market-prices">Market Prices</a>
          <a href="#about">About</a>
        </nav>
        <div className="lang-switcher">
          <button 
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`} 
            onClick={() => setLang('en')}
          >
            English
          </button>
          <span className="divider">|</span>
          <button 
            className={`lang-btn ${lang === 'te' ? 'active' : ''}`} 
            onClick={() => setLang('te')}
          >
            తెలుగు
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          <span className="hero-tag">Empowering Indian Farmers</span>
          <h1 className="hero-title">Find the Best Market for Your Crop</h1>
          <p className="hero-subtitle">Better price. Lower transport. Better returns.</p>
          <p className="hero-desc">
            Compare real mandi prices, live transport costs, and true net returns before booking transport.
          </p>
          <a href="#input-section" className="cta-button">Find Best Market</a>
        </div>
        <div className="hero-image-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=900&q=80" 
            alt="Indian farmer in agricultural field" 
            className="hero-img"
          />
        </div>
      </section>

      {/* Farmer Input Card */}
      <section className="input-section" id="input-section">
        <div className="input-card">
          <h2 className="card-title">Tell us about your crop</h2>
          <form onSubmit={handleSearch} className="crop-form">
            <div className="form-group">
              <label htmlFor="crop">Crop Name</label>
              <input 
                id="crop"
                type="text" 
                placeholder="e.g., Tomato, Paddy, Chilli" 
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="quantity">Quantity (in kg)</label>
              <input 
                id="quantity"
                type="number" 
                placeholder="e.g., 1000" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">Your Location</label>
              <input 
                id="location"
                type="text" 
                placeholder="Village or Mandal (e.g., Duggirala)" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <div className="form-actions">
              <button type="button" className="voice-btn" title="Voice Input">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
                <span>Speak</span>
              </button>
              <button type="submit" className="submit-btn">Find Best Market</button>
            </div>
          </form>
        </div>
      </section>

      {/* Results Demo Section */}
      {showResults && (
        <section className="results-section">
          <div className="best-market-card">
            <div className="badge-wrapper">
              <span className="winner-badge">BEST MARKET FOR YOU</span>
            </div>
            <h3 className="market-name">Tenali Market</h3>
            <div className="metrics-grid">
              <div className="metric">
                <span className="metric-label">Market Rate</span>
                <span className="metric-val">₹26/kg</span>
              </div>
              <div className="metric">
                <span className="metric-label">Distance</span>
                <span className="metric-val">25 km</span>
              </div>
              <div className="metric">
                <span className="metric-label">Transport Cost</span>
                <span className="metric-val">₹1,500</span>
              </div>
            </div>
            <div className="net-return-container">
              <span className="return-label">Estimated Net Return</span>
              <span className="return-val">₹24,500</span>
            </div>
            <div className="recommendation-reason">
              <p><strong>Why recommended?</strong> Highest estimated net return after subtracting transport costs from gross mandi value.</p>
            </div>
          </div>

          <div className="table-wrapper">
            <h3 className="section-title">Market Price Comparison</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Price</th>
                  <th>Transport</th>
                  <th>Net Return</th>
                </tr>
              </thead>
              <tbody>
                <tr className="highlight-row">
                  <td><strong>Tenali</strong></td>
                  <td>₹26/kg</td>
                  <td>₹1,500</td>
                  <td className="highlight-cell">₹24,500 ★</td>
                </tr>
                <tr>
                  <td>Vijayawada</td>
                  <td>₹28/kg</td>
                  <td>₹4,000</td>
                  <td>₹24,000</td>
                </tr>
                <tr>
                  <td>Guntur</td>
                  <td>₹25/kg</td>
                  <td>₹2,000</td>
                  <td>₹23,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Trust & Workflow Cards */}
      <section className="features-section" id="how-it-works">
        <h2 className="section-title">How SMARTMandi Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-num">1</div>
            <h3>Compare Market Prices</h3>
            <p>Live, verified wholesale prices from all regulated mandis near you.</p>
          </div>
          <div className="feature-card">
            <div className="feature-num">2</div>
            <h3>Calculate Logistics</h3>
            <p>Accurate freight estimates based on crop tonnage and road distance.</p>
          </div>
          <div className="feature-card">
            <div className="feature-num">3</div>
            <h3>Estimate Net Return</h3>
            <p>Gross revenue minus fuel and transport equals actual profit in hand.</p>
          </div>
          <div className="feature-card">
            <div className="feature-num">4</div>
            <h3>Make Direct Decisions</h3>
            <p>Transparent reasoning helps you choose where to drive your vehicle.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>SMARTMandi — Smart India Hackathon 2026 Initiative</p>
      </footer>
    </div>
  );
}

export default App;