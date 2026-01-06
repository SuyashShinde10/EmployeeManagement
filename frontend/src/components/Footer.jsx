import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-top pt-5 pb-3">
      <div className="container">
        <div className="row g-4">
          
          {/* Column 1: Brand */}
          <div className="col-lg-4 col-md-6">
            <h5 className="fw-bold text-primary mb-3">⚡ TeamSync</h5>
            <p className="text-muted small lh-lg">
              Streamline your team's workflow with our industry-leading task management platform. 
              Secure, efficient, and designed for modern collaboration.
            </p>
            <div className="d-flex gap-3">
                <span className="bg-light rounded-circle d-flex align-items-center justify-content-center text-secondary" style={{width: 35, height: 35}}>𝕏</span>
                <span className="bg-light rounded-circle d-flex align-items-center justify-content-center text-secondary" style={{width: 35, height: 35}}>in</span>
                <span className="bg-light rounded-circle d-flex align-items-center justify-content-center text-secondary" style={{width: 35, height: 35}}>f</span>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="fw-bold mb-3">Product</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="#" className="text-decoration-none text-muted small">Features</Link></li>
              <li className="mb-2"><Link to="#" className="text-decoration-none text-muted small">Pricing</Link></li>
              <li className="mb-2"><Link to="#" className="text-decoration-none text-muted small">Integrations</Link></li>
              <li className="mb-2"><Link to="#" className="text-decoration-none text-muted small">Changelog</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="fw-bold mb-3">Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="#" className="text-decoration-none text-muted small">About Us</Link></li>
              <li className="mb-2"><Link to="#" className="text-decoration-none text-muted small">Careers</Link></li>
              <li className="mb-2"><Link to="#" className="text-decoration-none text-muted small">Blog</Link></li>
              <li className="mb-2"><Link to="#" className="text-decoration-none text-muted small">Contact</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="col-lg-4 col-md-12">
            <h6 className="fw-bold mb-3">Stay Updated</h6>
            <p className="text-muted small">Join our newsletter for the latest feature updates.</p>
            <div className="input-group mb-3">
                <input type="email" className="form-control border-light bg-light" placeholder="Enter your email" />
                <button className="btn btn-dark fw-bold">Subscribe</button>
            </div>
          </div>
        </div>

        <hr className="my-4 text-muted opacity-25" />

        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <small className="text-muted">© 2024 TeamSync Inc. All rights reserved.</small>
          <div className="d-flex gap-3">
             <Link to="#" className="text-decoration-none text-muted small">Privacy Policy</Link>
             <Link to="#" className="text-decoration-none text-muted small">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;