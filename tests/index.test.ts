import * as fs from 'fs'
import { PassThrough, TransformCallback } from 'stream'
import { parse, BlockType } from '@progfay/scrapbox-parser'
import { ScrapboxParserStream } from '../src'

const BODY_FILE_PATH = './tests/body.txt'
const TABLE_FILE_PATH = './tests/table.txt'

class CheckStream<T> extends PassThrough {
  done: jest.DoneCallback
  check: (chunk: T) => void

  constructor (check: (chunk: T) => void, done: jest.DoneCallback) {
    super({ objectMode: true })
    this.check = check
    this.done = done
  }

  _transform (chunk: T, _encoding: string, callback: TransformCallback) {
    this.check(chunk)
    callback()
  }

  _final (callback: TransformCallback) {
    this.done()
    callback()
  }
}

describe('stream', () => {
  it('Same behavior', async (done) => {
    const generateChecker = () => {
      const page = fs.readFileSync(BODY_FILE_PATH, { encoding: 'utf8' })
      const answer = parse(page, { hasTitle: true })
      return (block: BlockType) => {
        expect(block).toEqual(answer.shift())
      }
    }

    fs.createReadStream(BODY_FILE_PATH, { highWaterMark: 100, encoding: 'utf8' })
      .pipe(new ScrapboxParserStream({ hasTitle: true }))
      .pipe(new CheckStream(generateChecker(), done))
  })

  it('Parsing only table', async (done) => {
    fs.createReadStream(TABLE_FILE_PATH, { highWaterMark: 100, encoding: 'utf8' })
      .pipe(new ScrapboxParserStream({ hasTitle: true }))
      .pipe(new CheckStream(() => {}, done))
  })

  it('No Title Block when `hasTitle === false`', async (done) => {
    const check = (block: BlockType) => { expect(block.type).not.toEqual('title') }
    fs.createReadStream(BODY_FILE_PATH, { highWaterMark: 100, encoding: 'utf8' })
      .pipe(new ScrapboxParserStream({ hasTitle: false }))
      .pipe(new CheckStream(check, done))
  })
})
