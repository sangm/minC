# minCParser built with JavaScript (Harmony)

## Directories/Files
+ ![a](img/tree.png)
+ minCParser/test/ is for unit tests
+ minCParser/src/ contains the actual file before it's transpied
+ minCParser/dist/ contains files that browsers (nowadays) can render

## Usage
+ run `npm run init` in the project root directory
+ use `node minCParserDrive.js filename` to run a file
+ run `npm run parser` to convert all src(ES6) files to dist

## Semantic Analysis Notes
+ To allow overloading functions, my entry in the symbol table is the same as my type 
+ Currently do not allow array within arrays like a[b[20]]

## Examples
+ ![ex1](img/ex1.png)

