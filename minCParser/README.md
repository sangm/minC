# minCParser built with JavaScript (Harmony)

## Driver
+ Usage: node minC.js --file(optional) filename --folding(optional) --overloading(optional)

## Semantic Analysis Notes
+ Allows overloading functions (not 100%). Does not "lookup" correctly(due to not having enough time to correctly parse type), so will throw "Undeclared Error"
+ Cannot handle recursion as of now. When funcCallExpr is evaluted, I am checking to see if the function is declared (it won't, until the function itself has been parsed through)
+ To run unit tests, `npm run test`
+ To build: `npm run build`

## Code Generation Notes
+ Global variables will get initialized to 0

### Manifests
+ minCParser/test/ is for unit tests
+ minCParser/src/ contains the actual file before it's transpied
+ minCParser/dist/ contains files that browsers (nowadays) can render
+ minCParser/src/minCParser.jison is the grammar file
+ minCParser/src/symbol-table, minCParser/src/util, is relevant for semantic analysis



