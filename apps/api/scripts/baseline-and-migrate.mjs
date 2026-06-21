import { execSync } from 'node:child_process'
import { PrismaClient } from '@prisma/client'

const schema = './prisma/schema.prisma'
const INIT_MIGRATION = '20260620111533_init'
const prisma = new PrismaClient()

function run(command) {
  execSync(command, { stdio: 'inherit' })
}

async function tableExists(name) {
  const [{ reg }] = await prisma.$queryRaw`
    SELECT to_regclass(${`public.${name}`})::text AS reg
  `
  return reg !== null
}

async function migrationApplied(name) {
  try {
    const rows = await prisma.$queryRaw`
      SELECT migration_name FROM "_prisma_migrations" WHERE migration_name = ${name}
    `
    return rows.length > 0
  } catch {
    return false
  }
}

async function columnExists(table, column) {
  const [{ exists }] = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ${table}
        AND column_name = ${column}
    ) AS exists
  `
  return exists
}

async function resolveFailedMigrations() {
  let failed = []
  try {
    failed = await prisma.$queryRaw`
      SELECT migration_name
      FROM "_prisma_migrations"
      WHERE finished_at IS NULL AND rolled_back_at IS NULL
    `
  } catch {
    return
  }

  for (const { migration_name } of failed) {
    if (migration_name === '20260620113000_metric_tracking_and_history') {
      const applied = await columnExists('publications', 'metricTrackingMode')
      const flag = applied ? '--applied' : '--rolled-back'
      console.log(`Resolving failed migration ${migration_name} as ${flag.slice(2)}…`)
      run(`npx prisma migrate resolve ${flag} ${migration_name} --schema="${schema}"`)
      continue
    }

    console.log(`Resolving failed migration ${migration_name} as rolled-back…`)
    run(`npx prisma migrate resolve --rolled-back ${migration_name} --schema="${schema}"`)
  }
}

try {
  await resolveFailedMigrations()

  const hasUsers = await tableExists('users')
  const hasInit = await migrationApplied(INIT_MIGRATION)

  if (hasUsers && !hasInit) {
    console.log(`Baselining existing database at ${INIT_MIGRATION}…`)
    run(`npx prisma migrate resolve --applied ${INIT_MIGRATION} --schema="${schema}"`)
  }
} finally {
  await prisma.$disconnect()
}

console.log('Applying pending migrations…')
run(`npx prisma migrate deploy --schema="${schema}"`)
console.log('Migrations complete.')
