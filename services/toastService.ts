// services/toastService.ts
// Simple toast helper implementation using console for now.
// Replace with a proper UI toast library as needed.

export const addToast = (msg: string, type: 'success' | 'error' = 'success') => {
  const style = type === 'success' ? 'color: green; font-weight: bold;' : 'color: red; font-weight: bold;';
  console.log(`%c${type.toUpperCase()}: ${msg}`, style);
};
