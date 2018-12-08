import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '[]'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '[{"line":1,"type":"Variable Declaration","name":"a","condition":null,"value":"1"}]'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = -1;')),
            '[{"line":1,"type":"Variable Declaration","name":"a","condition":null,"value":"-1"}]'
        );
    });

    it('is parsing a simple assignment correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('a = x;')),
            '[{"line":1,"type":"Assignment Expression","name":"a","condition":null,"value":null}]'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a;')),
            '[{"line":1,"type":"Variable Declaration","name":"a","condition":null,"value":null}]'
        );
    });

    it('is parsing a simple let statement correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let low, high, mid;')),
            '[{"line":1,"type":"Variable Declaration","name":"low","condition":null,"value":null},{"line":1,"type":"Variable Declaration","name":"high","condition":null,"value":null},{"line":1,"type":"Variable Declaration","name":"mid","condition":null,"value":null}]'
        );
    });
    it('is parsing a simple while loop correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('while (low <= high) {}')),
            '[{"line":1,"type":"While Statement","name":null,"condition":"low<=high","value":null}]');
    });
    it('is parsing a simple for  correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('for (let i = 0; i < 10; i++) {}' )),
            '[{"line":1,"type":"For Statement","name":null,"condition":"let i = 0;i < 10;i++","value":null}]');
    });
    it('is parsing a simple for with no init correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('for (; i < 10; i++) {}')),
            '[{"line":1,"type":"For Statement","name":null,"condition":";i < 10;i++","value":null}]');
    });
    it('is parsing a simple forin  correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('for (a in abc) {}' )),
            '[{"line":1,"type":"ForIn Statement","name":null,"condition":"a in abc","value":null}]');
    });
    it('is parsing a simple if correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('if (X < V[mid]) {}' )),
            '[{"line":1,"type":"If Statement","name":null,"condition":"X<V[mid]","value":null}]');
    });
    it('is parsing a simple if else correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('if (X < V[mid]) {\n' +
                '}\n' +
                'else if (n == 1) {}' )),
            '[{"line":1,"type":"If Statement","name":null,"condition":"X<V[mid]","value":null},{"line":3,"type":"If Statement","name":null,"condition":"n==1","value":null}]');
    });

    it('is parsing a simple return correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function binarySearch(X, V, n){\n' +
                'return -1;\n' +
                '}' )),
            '[{"line":1,"type":"FunctionDeclaration","name":"binarySearch","condition":null,"value":null},{"line":1,"type":"Variable Declaration","name":"X","condition":null,"value":null},{"line":1,"type":"Variable Declaration","name":"V","condition":null,"value":null},{"line":1,"type":"Variable Declaration","name":"n","condition":null,"value":null},{"line":2,"type":"Return Statement","name":null,"condition":null,"value":"-1"}]');
    });
    it('is parsing lecturers test correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function binarySearch(X, V, n){\n' +
                '    let low, high, mid;\n' +
                '    low = 0;\n' +
                '    high = n - 1;\n' +
                '    while (low <= high) {\n' +
                '        mid = (low + high)/2;\n' +
                '        if (X < V[mid])\n' +
                '            high = mid - 1;\n' +
                '        else if (X > V[mid])\n' +
                '            low = mid + 1;\n' +
                '        else\n' +
                '            return mid;\n' +
                '    }\n' +
                '    return -1;\n' +
                '}' )),
            '[{"line":1,"type":"FunctionDeclaration","name":"binarySearch","condition":null,"value":null},{"line":1,"type":"Variable Declaration","name":"X","condition":null,"value":null},{"line":1,"type":"Variable Declaration","name":"V","condition":null,"value":null},{"line":1,"type":"Variable Declaration","name":"n","condition":null,"value":null},{"line":2,"type":"Variable Declaration","name":"low","condition":null,"value":null},{"line":2,"type":"Variable Declaration","name":"high","condition":null,"value":null},{"line":2,"type":"Variable Declaration","name":"mid","condition":null,"value":null},{"line":3,"type":"Assignment Expression","name":"low","condition":null,"value":"0"},{"line":4,"type":"Assignment Expression","name":"high","condition":null,"value":"n-1"},{"line":5,"type":"While Statement","name":null,"condition":"low<=high","value":null},{"line":6,"type":"Assignment Expression","name":"mid","condition":null,"value":"low+high/2"},{"line":7,"type":"If Statement","name":null,"condition":"X<V[mid]","value":null},{"line":8,"type":"Assignment Expression","name":"high","condition":null,"value":"mid-1"},{"line":9,"type":"If Statement","name":null,"condition":"X>V[mid]","value":null},{"line":10,"type":"Assignment Expression","name":"low","condition":null,"value":"mid+1"},{"line":12,"type":"Return Statement","name":null,"condition":null,"value":"mid"},{"line":14,"type":"Return Statement","name":null,"condition":null,"value":"-1"}]');
    });
});
