import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pub = path.join(__dirname, '../public/achievements')

const zipCandidates = [
  path.join(process.env.USERPROFILE, 'OneDrive', 'Рабочий стол', 'ачивки.zip'),
  path.join(process.env.USERPROFILE, 'Desktop', 'ачивки.zip'),
]

function findInDir(dir, predicate) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      const nested = findInDir(full, predicate)
      if (nested) return nested
    } else if (predicate(name)) {
      return full
    }
  }
  return null
}

function copyFromZip() {
  const zip = zipCandidates.find((p) => fs.existsSync(p))
  if (!zip) return false

  const extractDir = path.join(pub, '_import-temp')
  fs.rmSync(extractDir, { recursive: true, force: true })
  fs.mkdirSync(extractDir, { recursive: true })

  execSync(
    `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zip.replace(/'/g, "''")}' -DestinationPath '${extractDir.replace(/'/g, "''")}' -Force"`,
    { stdio: 'inherit' }
  )

  const champion = findInDir(
    extractDir,
    (n) => n.includes('69884927') || n.includes('delightful-3d-render-of-a-colorful-achievement')
  )
  const salary = findInDir(
    extractDir,
    (n) => n.includes('79065397') || n.includes('savings-and-coin')
  )

  fs.mkdirSync(pub, { recursive: true })
  if (champion) {
    fs.copyFileSync(champion, path.join(pub, 'hr-champion.png'))
    console.log('hr-champion.png <=', path.basename(champion))
  }
  if (salary) {
    fs.copyFileSync(salary, path.join(pub, 'trainee-first-salary.png'))
    console.log('trainee-first-salary.png <=', path.basename(salary))
  }

  fs.rmSync(extractDir, { recursive: true, force: true })
  return Boolean(champion || salary)
}

if (!copyFromZip()) {
  const assetDir = path.join(
    process.env.USERPROFILE,
    '.cursor/projects/c-Users-lexas-Naumen-HR/assets'
  )
  if (fs.existsSync(assetDir)) {
    const srcName = fs
      .readdirSync(assetDir)
      .filter((name) => name.includes('69884927'))
      .sort()
      .at(-1)
    if (srcName) {
      fs.copyFileSync(path.join(assetDir, srcName), path.join(pub, 'hr-champion.png'))
      console.log('hr-champion.png <= Cursor assets')
    }
  }
}
