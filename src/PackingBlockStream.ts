import { Transform, TransformCallback } from 'stream'
import { ParserOption } from '@progfay/scrapbox-parser'
import { TitleComponent } from '@progfay/scrapbox-parser/lib/block/Title'
import { BlockComponent } from '@progfay/scrapbox-parser/lib/block/BlockComponent'
import { LineComponent } from '@progfay/scrapbox-parser/lib/block/Line'
import { CodeBlockComponent } from '@progfay/scrapbox-parser/lib/block/CodeBlock'
import { TableComponent } from '@progfay/scrapbox-parser/lib/block/Table'

export default class PackingStream extends Transform {
  shouldPackTitle: boolean
  packingComponent: ((CodeBlockComponent | TableComponent) & { indent: number }) | null = null

  constructor ({ hasTitle }: ParserOption) {
    super({ objectMode: true })
    this.shouldPackTitle = hasTitle
  }

  _transform (blockComponent: BlockComponent, _encoding: string, callback: TransformCallback): void {
    if (this.shouldPackTitle) {
      this.shouldPackTitle = false
      const titleBlockComponent: TitleComponent = {
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
      } as ((CodeBlockComponent | TableComponent) & { indent: number })
      return callback()
    }

    const lineComponent: LineComponent = {
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
