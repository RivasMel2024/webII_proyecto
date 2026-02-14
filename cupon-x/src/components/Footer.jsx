import React from 'react';
import { Container } from 'react-bootstrap';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="simple-footer">
      <Container className="text-center">
        {/* Branding con un solo color */}
        <div className="footer-logo-box mb-4">
          <h3 className="footer-logo">CuponX</h3>
          <p className="footer-tagline">Encuentra los mejores ahorros en un solo lugar.</p>
        </div>

        {/* Redes Sociales */}
        <div className="footer-socials mb-4">
          <a href="#" className="social-icon"><FaTwitter /></a>
          <a href="#" className="social-icon"><FaInstagram /></a>
        </div>

        <div className="footer-divider"></div>

        {/* Copyright */}
        <div className="footer-copyright mt-4">
          <p>© {new Date().getFullYear()} CuponX. Todos los derechos reservados.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;