# Scrapbox Parser Stream

Parsing Scrapbox notation with Node.js Stream

## Installation

```sh
$ npm i @progfay/scrapbox-parser-stream
```


## Usage

```js
import ScrapboxParserStream from '@progfay/scrapbox-parser-stream'
import fetch from 'node-fetch'

const PROJECT_NAME = 'help'
const PAGE_NAME = 'syntax'

fetch(`https://scrapbox.io/api/pages/${PROJECT_NAME}/${PAGE_NAME}/text`)
	.then(({ body }) => {
		body
			.pipe(new ScrapboxParserStream({ hasTitle: true }))
			.pipe(process.stdout)
	})
```
