// theme.js
export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('selectedTheme', theme);
}

export function initThemeSwitcher(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  const savedTheme = localStorage.getItem('selectedTheme') || 'light';
  applyTheme(savedTheme);
  dropdown.value = savedTheme;

  dropdown.addEventListener('change', () => {
    applyTheme(dropdown.value);
  });
}
