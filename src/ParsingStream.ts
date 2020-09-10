import { Transform, TransformCallback } from 'stream'
import { convertToBlock } from '@progfay/scrapbox-parser/lib/block'
import { PackedBlockComponent } from '@progfay/scrapbox-parser/lib/block/PackedBlockComponent'

export default class ParserStream extends Transform {
  constructor () {
    super({ objectMode: true })
  }

  _transform (chunk: PackedBlockComponent, _encoding: string, callback: TransformCallback) {
    callback(null, convertToBlock(chunk))
  }
}
