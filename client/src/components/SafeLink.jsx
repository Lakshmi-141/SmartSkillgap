import React from 'react';

/**
 * SafeLink ensures all external URLs use http/https protocol
 * and include rel="noopener noreferrer" for security.
 */
const SafeLink = ({ href, children, className = '', ...props }) => {
  if (!href) return <span className={className}>{children}</span>;

  // Validate URL protocol (reject javascript: and data: URLs)
  const isValidUrl = /^https?:\/\//i.test(href);

  if (!isValidUrl) {
    return (
      <span className={`text-gray-400 cursor-not-allowed ${className}`} title="Invalid or unsafe URL">
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...props}
    >
      {children}
    </a>
  );
};

export default SafeLink;
