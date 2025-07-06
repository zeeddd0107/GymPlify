const { execSync } = require('child_process');

function runLint(name, cwd, ext) {
  try {
    console.log(name);
    execSync(`npx eslint . --ext ${ext} --fix`, { cwd, stdio: 'inherit' });
  } catch (e) {
    console.error(`${name.split(' ')[1]} lint failed.`);
    process.exit(1);
  }
}

console.log('🔍 Running ESLint checks for backend, web, and mobile...');
runLint('📦 Linting backend...', 'backend', '.js');
runLint('🌐 Linting web...', 'web', '.js,.jsx');
runLint('📱 Linting mobile...', 'mobile', '.js,.jsx');
console.log('✅ All lint checks passed!');

try {
  console.log('🧪 Running tests...');
  execSync('npm test', { stdio: 'inherit' });
} catch (e) {
  console.error('Tests failed.');
  process.exit(1);
}

try {
  console.log('🔎 Running lint-staged...');
  execSync('npx lint-staged', { stdio: 'inherit' });
} catch (e) {
  console.error('lint-staged failed.');
  process.exit(1);
}

console.log('✅ Pre-commit checks complete. Proceeding to commit...'); 