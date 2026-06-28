/**
 * Frontend branding / org config. Generic defaults; override via a gitignored
 * .env.local (VITE_* vars) for a real deployment. See .env.example.
 */
export const OWNER_NAME = import.meta.env.VITE_OWNER_NAME ?? 'Jordan Mercer';
export const VENDOR_NAME =
  import.meta.env.VITE_VENDOR_NAME ?? 'Aegis Data Security';
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'SE Command';
export const SFDC_BASE_URL =
  import.meta.env.VITE_SFDC_BASE_URL ?? 'https://crm.example/opportunity';
