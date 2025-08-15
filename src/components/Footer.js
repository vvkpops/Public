import React from 'react';

const Footer = ({ lastUpdated }) => {
  return (
    <footer className="text-sm text-center text-gray-500 py-4 max-w-screen-2xl mx-auto">
      Live from Google Sheets | Updated <span>{lastUpdated}</span>
    </footer>
  );
};

export default Footer;