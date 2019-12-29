import { Transform, TransformCallback } from 'stream'
import { convertToBlock, PackedBlockComponentType } from '@progfay/scrapbox-parser'

export default class ParserStream extends Transform {
  constructor () {
    super({ objectMode: true })
  }

  _transform (chunk: PackedBlockComponentType, _encoding: string, callback: TransformCallback) {
    callback(null, convertToBlock(chunk))
  }
}
