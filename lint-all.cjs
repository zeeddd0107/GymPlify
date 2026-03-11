const { execSync } = require('child_process');

function runLint(name, cwd, ext) {
  try {
    console.log(name);
    // Use Yarn workspace binary instead of npx
    execSync(`yarn workspace ${cwd} run lint --ext ${ext} --fix`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`${name.split(' ')[1]} lint failed.`);
    process.exit(1);
  }
}

console.log(' Running ESLint checks for backend, web, and mobile...');
runLint(' Linting backend...', 'backend', '.js');
runLint(' Linting web...', 'web', '.js,.jsx');
runLint(' Linting mobile...', 'mobile', '.js,.jsx');
console.log(' All lint checks passed!');

try {
  console.log(' Running tests...');
  // Use Yarn workspaces instead of npm
  execSync('yarn workspaces run test', { stdio: 'inherit' });
} catch (e) {
  console.error('Tests failed.');
  process.exit(1);
}

try {
  console.log(' Running lint-staged...');
  // Run via Yarn to ensure local binary is used
  execSync('yarn lint-staged', { stdio: 'inherit' });
} catch (e) {
  console.error('lint-staged failed.');
  process.exit(1);
}

console.log(' Pre-commit checks complete. Proceeding to commit...');