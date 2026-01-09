export const themes = {
  dark: {
    name: 'Dark',
    type: 'dark',
    bgColor: '#0f172a',
    textColor: '#f1f5f9',
    focusColor: '#22d3ee',
    dimStrength: 0.95,
    btnBg: 'rgba(0, 0, 0, 0.5)',
    btnBorder: 'rgba(255, 255, 255, 0.1)',
    btnText: '#f1f5f9',
  },

  forest: {
    name: 'Forest',
    type: 'dark',
    bgColor: '#0b1f17',
    textColor: '#d1fae5',
    focusColor: '#34d399',
    dimStrength: 0.95,
    btnBg: 'rgba(11, 31, 23, 0.85)',
    btnBorder: 'rgba(209, 250, 229, 0.15)',
    btnText: '#d1fae5',
  },

  ember: {
    name: 'Ember',
    type: 'dark',
    bgColor: '#1a0f0a',
    textColor: '#fde68a',
    focusColor: '#f97316',
    dimStrength: 0.96,
    btnBg: 'rgba(26, 15, 10, 0.85)',
    btnBorder: 'rgba(253, 230, 138, 0.18)',
    btnText: '#fde68a',
  },

  ocean: {
    name: 'Ocean',
    type: 'dark',
    bgColor: '#0c1e2c',
    textColor: '#e0f2fe',
    focusColor: '#38bdf8',
    dimStrength: 0.95,
    btnBg: 'rgba(12, 30, 44, 0.85)',
    btnBorder: 'rgba(224, 242, 254, 0.15)',
    btnText: '#e0f2fe',
  },

  amoled: {
    name: 'AMOLED',
    type: 'dark',
    bgColor: '#000000',
    textColor: '#e5e7eb',
    focusColor: '#3b82f6',
    dimStrength: 1.0,
    btnBg: '#000000',
    btnBorder: 'rgba(229, 231, 235, 0.2)',
    btnText: '#e5e7eb',
  },


  solarizedDark: {
    name: 'Solarized Dark',
    type: 'dark',
    bgColor: '#002b36',
    textColor: '#93a1a1',
    focusColor: '#2aa198',
    dimStrength: 0.95,
    btnBg: 'rgba(0, 43, 54, 0.85)',
    btnBorder: 'rgba(147, 161, 161, 0.15)',
    btnText: '#93a1a1',
  },

  night: {
    name: 'Night Reader',
    type: 'dark',
    bgColor: '#1e1b4b',
    textColor: '#e0e7ff',
    focusColor: '#818cf8',
    dimStrength: 0.96,
    btnBg: 'rgba(30, 27, 75, 0.85)',
    btnBorder: 'rgba(224, 231, 255, 0.12)',
    btnText: '#e0e7ff',
  },

  highContrast: {
    name: 'High Contrast',
    type: 'dark',
    bgColor: '#000000',
    textColor: '#ffffff',
    focusColor: '#ffff00',
    dimStrength: 0.98,
    btnBg: '#000000',
    btnBorder: '#ffffff',
    btnText: '#ffffff',
  },

  // custom: {
  //   name: 'Custom',
  //   type: 'light',
  //   bgColor: '#ffffff',
  //   textColor: '#000000',
  //   focusColor: '#2488ff',
  //   dimStrength: 0.04,
  //   btnBg: '#ffffff',
  //   btnBorder: 'rgba(0, 0, 0, 0.1)',
  //   btnText: '#000000',
  //   isCustom: true,
  // },
};


export function applyTheme(theme) {
  const root = document.documentElement;

  root.style.setProperty('--bg-color', theme.bgColor);
  root.style.setProperty('--text-color', theme.textColor);
  root.style.setProperty('--focus-color', theme.focusColor);

  const overlay =
    theme.type === 'light'
      ? `rgba(255, 255, 255, ${theme.dimStrength})`
      : `rgba(0, 0, 0, ${theme.dimStrength})`;

  root.style.setProperty('--dim-overlay', overlay);

  if (theme.type === 'light') {
    root.style.setProperty('--surface-bg', '#ffffff');
    root.style.setProperty('--surface-border', 'rgba(0,0,0,0.08)');
  } else {
    root.style.setProperty('--surface-bg', 'rgba(255,255,255,0.05)');
    root.style.setProperty('--surface-border', 'rgba(255,255,255,0.1)');
  }


  root.style.setProperty('--btn-bg', theme.btnBg);
  root.style.setProperty('--btn-border', theme.btnBorder);
  root.style.setProperty('--btn-text', theme.btnText);
}
