import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n', '(x=1,y=2,z=3)'),
            'function foo(x, y, z) {\n' +
            '<highlight_red>    if (x + 1 + y < z) {</highlight_red>\n' +
            '        return x + y + z + 0 + 5;\n' +
            '<highlight_green>    } else if (x + 1 + y < z * 2) {</highlight_green>\n' +
            '        return x + y + z + 0 + x + 5;\n' +
            '    } else {\n' +
            '        return x + y + z + 0 + z + 5;\n' +
            '    }\n' +
            '}'
        );
    });

    it('is parsing an empty function correctly', () => {
        assert.equal(
            parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    while (a < z) {\n' +
                '        c = a + b;\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    \n' +
                '    return z;\n' +
                '}\n', '(x=1,y=2,z=3)'),
            'function foo(x, y, z) {\n' +
            '    while (x + 1 < z) {\n' +
            '        z = (x + 1 + x + 1 + y) * 2;\n' +
            '    }\n' +
            '    return z;\n' +
            '}'
        );
    });

    it('is parsing an empty function correctly', () => {
        assert.equal(
            parseCode('function f(x,y){\n' +
                ' let a = 1;\n' +
                ' x = y;\n' +
                ' if(x > 1){\n' +
                '  a = 7;}\n' +
                ' else{\n' +
                '  a = y;}\n' +
                ' return a;\n' +
                '}', '(x=1,y=2)'),
            'function f(x, y) {\n' +
            '    x = y;\n' +
            '<highlight_green>    if (y > 1) {</highlight_green>\n' +
            '    } else {\n' +
            '    }\n' +
            '    return 7;\n' +
            '}'
        );
    });

    it('is parsing an empty function correctly', () => {
        assert.equal(
            parseCode('function foo(x, y, z){\n' +
                ' let a = 1;\n' +
                ' z[0] = 4;\n' +
                ' if(x == 1){\n' +
                '  a = 3;\n' +
                ' }\n' +
                ' else{\n' +
                '  a = 2;\n' +
                ' }\n' +
                '    return z + a;\n' +
                '}', '(x=1,y=2,z=3)'),
            'function foo(x, y, z) {\n' +
            '<highlight_green>    if (x == 1) {</highlight_green>\n' +
            '    } else {\n' +
            '    }\n' +
            '    return z + 3;\n' +
            '}'
        );
    });

    it('is parsing an empty function correctly', () => {
        assert.equal(
            parseCode('function foo(x, y, z){\n' +
                ' let a = 1;\n' +
                ' let arr = [1,2,3];\n' +
                ' let b = z[2];\n' +
                ' let c = a + 5 / 2 - 1 * 2;\n' +
                ' z[1] = 2;\n' +
                ' if (a == b){\n' +
                '    a = b;\n' +
                '    return b;\n' +
                ' }\n' +
                ' return a;\n' +
                '}', '(x=1,y=2,z=3)'),
            'function foo(x, y, z) {\n' +
            '<highlight_red>    if (1 == z[2]) {</highlight_red>\n' +
            '        return z[2];\n' +
            '    }\n' +
            '    return 1;\n' +
            '}'
        );
    });
});
