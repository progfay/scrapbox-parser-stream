import { Transform, TransformCallback } from 'stream'
import { BlockComponentType } from '@progfay/scrapbox-parser'

const convertToBlockComponent = (block: string): BlockComponentType => ({
  indent: block.match(/^\s+/)?.[0].length ?? 0,
  text: block
})

export default class ConvertToBlockStream extends Transform {
  rest = ''

  constructor () {
    super({ objectMode: true })
  }

  _transform (chunk: Buffer, _encoding: string, callback: TransformCallback) {
    const lines = (this.rest + chunk.toString()).split('\n')
    this.rest = lines.pop() as string
    for (const line of lines) {
      this.push(convertToBlockComponent(line))
    }
    callback()
  }

  _final (callback: TransformCallback) {
    callback(null, convertToBlockComponent(this.rest))
  }
}
