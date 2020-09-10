import { Transform, TransformCallback } from 'stream'
import { BlockComponent } from '@progfay/scrapbox-parser/lib/block/BlockComponent'

const convertToBlockComponent = (block: string): BlockComponent => ({
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
    if (this.rest !== '') this.push(convertToBlockComponent(this.rest))
    return callback()
  }
}
