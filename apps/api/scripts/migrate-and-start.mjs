import { execSync } from 'node:child_process'

function run(command) {
  execSync(command, { stdio: 'inherit' })
}

run('node scripts/baseline-and-migrate.mjs')
console.log('Starting API…')
run('node dist/apps/api/src/main.js')
