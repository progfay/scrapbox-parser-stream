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
    this.shouldPackTitle = false
    const titleBlockComponent: TitleComponentType  = {
      type: 'title',
      text: blockComponent.text
    }
    this.push(titleBlockComponent)
    return callback()
  }

    const { indent, text } = blockComponent
    if (this.packingComponent) {
      if (indent > this.packingComponent.indent) {
        this.packingComponent.components.push(blockComponent)
        return callback()
      } else {
        this.push(this.packingComponent)
        this.packingComponent = null
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
      return callback()
    }

    const lineComponent: LineComponentType = {
      type: 'line',
      component: blockComponent
    }
    this.push(lineComponent)
    return callback()
  }

  _final (callback: TransformCallback): void {
    if (this.packingComponent) this.push(this.packingComponent)
    return callback()
  }
}
