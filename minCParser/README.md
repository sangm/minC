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
+ Target Architecture: MIPS

### Activation Record
+ Result of a function call is always in the accumulator (top of the stack)
+ No need to store it in the activation record
+ Activation Record consist of parameters f(a1, a2, ... an) + $fp

### Register Allocation
+ I've decided to implement a stack machine instead of register based.
+ Invariants of the Stack Machine
+ + register `$a1` holds the top of the stack
+ + rest of the stack is maintained by the $sp pointer
+ + $sp will be the same after every functiono call (equal pushes/pops)

### Extra Credit
+ Can hold arbituary amount of parameters (as big as the stack I suppose :) )
+ Built a web driver that will lex/parse/semantic/codegen in real time (Dr Qasem mentioned I might be able to attain extra credit from this)

### Bugs
+ Can't use recursive functions because of bug in semantic analyzer

### Manifests
+ minCParser/test/ is for unit tests
+ minCParser/src/ contains the actual file before it's transpied
+ minCParser/dist/ contains files that browsers (nowadays) can render
+ minCParser/src/minCParser.jison is the grammar file
+ minCParser/src/symbol-table, minCParser/src/util, is relevant for semantic analysis



