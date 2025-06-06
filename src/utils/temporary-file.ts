import * as path from 'node:path'
import * as os from 'node:os'
import * as crypto from 'node:crypto'
import * as fs from 'node:fs'

const uniqueString = () => crypto.randomBytes(8).toString('hex')

const tempDir = os.tmpdir()

export function temporaryFile({ extension }: { extension?: string } = {}): string {
  const baseName = uniqueString()
  const ext = extension ? '.' + extension.replace(/^\./, '') : ''
  return path.join(tempDir, baseName + ext)
}

export function temporaryDirectory({ prefix = '' } = {}): string {
  const directory = fs.mkdtempSync(`${tempDir}${path.sep}${prefix}`)
  return directory
}
