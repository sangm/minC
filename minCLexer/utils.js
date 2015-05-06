function getTokens(lexer) {
    var results = [];
    var result;
    var temp;
    while (true) {
        result = lexer.lex();
        if (result === 'EOF') 
            break;
        else if (result.toString && 
                 (result.toString().match('Minimal C') ||
                  result.toString().match('Unclosed')  ||
                  result.toString().match('Unterminated'))) {
            results.push(result);
        }
        else {
            temp = {}
            if (typeof result === 'object') {
                var key = Object.keys(result)[0];
                temp[key] = result[key];
            }
            else {
                temp[result] = lexer.yytext
            }

            results.push(temp);
        }
        
    }
    return results;
}

exports.getTokens = getTokens;
