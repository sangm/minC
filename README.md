# CS4318
## minCLexer
+ git clone `https://github.com/sangm/compiler.git`
+ `git submodule init` followed by `git submodule update` to get test files from another repositry
+ `git clone --recursive https://github.com/sangm/compiler.git` does the same thing :)
+ `cd compiler/minCLexer`
+ `npm install` to install dependencies
+ `npm test` to run unit tests
+ `node minCLexerDriver.js ` to run the scanner interactively
+ `node minCLexerDriver.js filename` to run the scanner on the file
+ `git submodule update --remote` to update test files 

### Dependencies
+ Make sure node/npm is installed

## Notes
+ I opted to include "EOF" as a valid file (empty files are allowed)
+ Since it's built with ES6, there is a `build` process
+ Please try to use a UTF8 supported terminal if possible 

## To get npm run watch working
+ edit node_modules/gulp/node_modules/vinyl-fs/node_modules/glob-watcher/node_modules/gaze/node_modules/globule/package.json to remove lodash
+ remove node_modules/gulp/node_modules/vinyl-fs/node_modules/glob-watcher/node_modules/gaze/node_modules/globule/node_modules/lodash

