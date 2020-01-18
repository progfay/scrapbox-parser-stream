import { Transform, TransformCallback } from 'stream'
import { ParserOptionType } from '@progfay/scrapbox-parser'
import { TitleComponentType } from '@progfay/scrapbox-parser/lib/block/Title'
import { BlockComponentType } from '@progfay/scrapbox-parser/lib/block/BlockComponent'
import { LineComponentType } from '@progfay/scrapbox-parser/lib/block/Line'
import { CodeBlockComponentType } from '@progfay/scrapbox-parser/lib/block/CodeBlock'
import { TableComponentType } from '@progfay/scrapbox-parser/lib/block/Table'

export default class PackingStream extends Transform {
  shouldPackTitle: boolean
  packingComponent: ((CodeBlockComponentType | TableComponentType) & { indent: number }) | null = null

  constructor ({ hasTitle }: ParserOptionType) {
    super({ objectMode: true })
    this.shouldPackTitle = hasTitle
  }

  _transform (blockComponent: BlockComponentType, _encoding: string, callback: TransformCallback): void {
  if (this.shouldPackTitle) {
    const titleBlockComponent: TitleComponentType  = {
      type: 'title',
      text: blockComponent.text
    }
    callback(null, titleBlockComponent)
    return
  }

    const { indent, text } = blockComponent
    if (this.packingComponent) {
      if (indent > this.packingComponent.indent) {
        this.packingComponent.components.push(blockComponent)
        callback()
        return
      } else {
        callback(null, this.packingComponent)
        this.packingComponent = null
        return
      }
    }

    const isCodeBlock = text.match(/^\s*code:(.+)$/)
    const isTable = text.match(/^\s*table:(.+)$/)
    if (isCodeBlock || isTable) {
      this.packingComponent = {
        type: isCodeBlock ? 'codeBlock' : 'table',
        components: [blockComponent],
        indent
      } as ((CodeBlockComponentType | TableComponentType) & { indent: number })
      callback()
      return
    } else {
      const lineComponent: LineComponentType = {
        type: 'line',
        component: blockComponent
      }
      callback(null, lineComponent)
      return
    }
  }

  _final (callback: TransformCallback) {
    callback(null, this.packingComponent)
  }
}
