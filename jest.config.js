/** @type {import('jest').Config} */
const config = {
  transform: {
    '^.+\\.tsx?$': [
      'esbuild-jest',
      {
        sourcemap: true,
      },
    ],
  },
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageReporters: ['text'],
};

export default config;
