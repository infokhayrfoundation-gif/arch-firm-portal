
import { User, InitialForm } from '../types';

/**
 * In a real production environment, you would deploy a Google Apps Script 
 * and use its Web App URL here. 
 */
const GOOGLE_SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/SIMULATED_ID/exec';

export const syncClientToSheets = async (user: User): Promise<boolean> => {
  console.log('[Sheets Sync] Recording Client Credentials:', {
    timestamp: new Date().toISOString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role
  });

  try {
    // We use a try-catch and simulate a real fetch request
    // In a real app, this would be: 
    // await fetch(GOOGLE_SHEET_WEBAPP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ type: 'user', ...user }) });
    
    await new Promise(resolve => setTimeout(resolve, 1200)); 
    return true;
  } catch (error) {
    console.error('[Sheets Sync] Failed to sync user:', error);
    return false;
  }
};

export const syncProjectBriefToSheets = async (user: User, form: InitialForm): Promise<boolean> => {
  console.log('[Sheets Sync] Recording Project Brief:', {
    timestamp: new Date().toISOString(),
    client_email: user.email,
    project_title: form.project_title,
    location: form.project_location,
    type: form.project_type,
    budget: form.budget,
    timeline: form.timeline,
    requirements: form.requirements
  });

  try {
    // Simulating the API call to Google Sheets
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  } catch (error) {
    console.error('[Sheets Sync] Failed to sync project brief:', error);
    return false;
  }
};
