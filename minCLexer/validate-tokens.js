(function () {
    function validateNumber(number, location) {
        var regexPattern = /^[1-9]\d*/;
        return (regexPattern.test(number) || number === '0') 
            ? 'INTCONST' : invalidToken(number, location);
    }
    function invalidToken(string, location) {
        if (location == null) {
            return "Location cannot be null";
        }
        var line = location.first_line;
        var col = location.last_column;
        var generateError = function generateError() {
            return "(" + line + "," + col + ")";
        };
        if (string[0] === "'") {
            return "Unclosed quote on character " + generateError();
        }
        else if (string[0] === '"') {
            return "Unterminated string " + generateError();
        }
        else if (string[0] === '/') {
            return "Unterminated comment " + generateError();
        }
        else if (string[0] === '0') {
            return "Minimal C does not allow leading 0s " + generateError();
        }
        return {ILLEGAL_TOK: string + ' ' + generateError()}
    }
    function validateString(string, location) {
        string = string.replace("\\t", "\t")
            .replace("\\n", "\n")
            .replace('\\"', "\"")
            .replace('\\\\', '\\');
        var result = string.substring(1, string.length-1);
        if (string[0] === "'") {
            if (result.length > 1)
                return invalidToken(string, location);
            return {CHARCONST: result.replace("\\'", "\'")};
        }
        else {
            return {STRCONST: result};
        }
    }
    exports.validateNumber = validateNumber;
    exports.invalidToken   = invalidToken;
    exports.validateString = validateString;
})();

