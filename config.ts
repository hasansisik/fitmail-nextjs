// Development server
export const server: string = "http://localhost:5003/v1";

// Production server
export const server2: string = "http://localhost:5003/v1";

// Active server based on environment
export const activeServer: string = process.env.NODE_ENV === 'production' ? server2 : server;

// Domain configuration
export const domains = {
  // Development domains
  development: {
    main: 'localhost',
    account: 'account.localhost',
    panel: 'panel.localhost',
    protocol: 'http',
    emailDomain: 'localhost'
  },
  // Production domains
  production: {
    main: 'localhost',
    account: 'account.localhost',
    panel: 'panel.localhost',
    protocol: 'http',
    emailDomain: 'localhost'
  }
};

// Active domain configuration based on environment
export const activeDomains = process.env.NODE_ENV === 'production' ? domains.production : domains.development;

// Helper functions for domain URLs
export const getMainDomainUrl = (path: string = '') => {
  return `${activeDomains.protocol}://${activeDomains.main}${path}`;
};

export const getAccountDomainUrl = (path: string = '') => {
  return `${activeDomains.protocol}://${activeDomains.account}${path}`;
};

export const getPanelDomainUrl = (path: string = '') => {
  return `${activeDomains.protocol}://${activeDomains.panel}${path}`;
};

// Check if current domain is a subdomain
export const isSubdomain = (hostname: string) => {
  // hostname port olmadan gelir, bu yüzden port kısmını çıkararak karşılaştır
  const accountHost = activeDomains.account.split(':')[0];
  const panelHost = activeDomains.panel.split(':')[0];
  
  return hostname === accountHost || hostname === panelHost;
};

// Get main domain from subdomain
export const getMainDomainFromSubdomain = (hostname: string) => {
  if (hostname.includes('localhost')) {
    return domains.development.main;
  }
  return domains.production.main;
};

// Check if hostname is account subdomain
export const isAccountSubdomain = (hostname: string) => {
  const accountHost = activeDomains.account.split(':')[0];
  return hostname === accountHost;
};

// Check if hostname is panel subdomain
export const isPanelSubdomain = (hostname: string) => {
  const panelHost = activeDomains.panel.split(':')[0];
  return hostname === panelHost;
};

// Get email domain (e.g., @localhost or @fitmail.com)
export const getEmailDomain = () => {
  return `@${activeDomains.emailDomain}`;
};
