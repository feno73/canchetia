export default {
  '*.{js,jsx,ts,tsx}': ['next lint --fix --file', 'prettier --write'],
  '*.{json,css,md}': ['prettier --write'],
};
