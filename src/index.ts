import { TransformOptions } from 'stream'
import { ParserOption } from '@progfay/scrapbox-parser'
import CombinedStream from './CombinedStream'
import ConvertToBlockStream from './ConvertToBlockStream'
import PackingBlockStream from './PackingBlockStream'
import ParsingStream from './ParsingStream'

export class ScrapboxParserStream extends CombinedStream {
  constructor ({ hasTitle = true, ...option }: Partial<ParserOption & TransformOptions> = {}) {
    super(
      option,
      new ConvertToBlockStream(),
      new PackingBlockStream({ hasTitle }),
      new ParsingStream()
    )
  }
}
