import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const mode = process.argv[2]

function markdownFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    if (entry === '.git' || entry === 'node_modules') return []
    const path = join(directory, entry)
    return statSync(path).isDirectory()
      ? markdownFiles(path)
      : extname(entry).toLowerCase() === '.md'
        ? [path]
        : []
  })
}

function fail(errors) {
  for (const error of errors) console.error(error)
  process.exitCode = 1
}

function checkLinks() {
  const errors = []
  const markdownLink = /!?\[[^\]]*\]\(([^)]+)\)/g

  for (const file of markdownFiles(root)) {
    const content = readFileSync(file, 'utf8')
    for (const match of content.matchAll(markdownLink)) {
      const rawTarget = match[1].trim().replace(/^<|>$/g, '').split(/\s+["']/)[0]
      if (!rawTarget || rawTarget.startsWith('#')) continue

      if (/^(https?:|mailto:)/i.test(rawTarget)) {
        try {
          new URL(rawTarget)
        } catch {
          errors.push(`${file}: malformed external URL: ${rawTarget}`)
        }
        continue
      }

      if (/^[a-z][a-z\d+.-]*:/i.test(rawTarget) || rawTarget.startsWith('/')) continue

      const fileTarget = decodeURIComponent(rawTarget.split('#')[0])
      const absoluteTarget = normalize(resolve(dirname(file), fileTarget))
      if (!absoluteTarget.startsWith(root) || !existsSync(absoluteTarget)) {
        errors.push(`${file}: missing local link target: ${rawTarget}`)
      }
    }
  }

  if (errors.length) fail(errors)
  else console.log('All local Markdown link targets exist.')
}

function checkGovernance() {
  const requiredFiles = [
    'AGENTS.md',
    'README.md',
    'PROJECT_DOCUMENTATION.md',
    'AI_DEVELOPMENT_WORKFLOW.md',
    'CURRENT_TASKS.md',
    'REPOSITORY_GUIDE.md',
    'docs/AI-TECHNICAL-GUIDE.md',
  ]
  const errors = requiredFiles
    .filter((file) => !existsSync(join(root, file)))
    .map((file) => `Missing required documentation file: ${file}`)

  const guidePath = join(root, 'docs/AI-TECHNICAL-GUIDE.md')
  if (existsSync(guidePath)) {
    const guide = readFileSync(guidePath, 'utf8')
    const sections = [
      'Repository Purpose',
      'Technology Stack',
      'Existing Architecture',
      'Folder Structure',
      'Coding Rules',
      'Business Rules',
      'Security Rules',
      'Testing Rules',
      'CI/CD Rules',
      'AI Development Workflow',
    ]
    for (const section of sections) {
      if (!guide.includes(section)) errors.push(`Technical guide is missing section: ${section}`)
    }
  }

  if (errors.length) fail(errors)
  else console.log('Documentation governance structure is valid.')
}

if (mode === 'links') checkLinks()
else if (mode === 'governance') checkGovernance()
else {
  console.error('Usage: node scripts/validate-docs.mjs <links|governance>')
  process.exitCode = 2
}
