// Global type declarations for React Native/Expo

declare const __DEV__: boolean;

// Allow JSON imports
declare module '*.json' {
  const value: any;
  export default value;
}
