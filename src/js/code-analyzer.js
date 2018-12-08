import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import * as format from 'string-format';
// let esprima = require ('esprima');
// let escodegen = require ('escodegen');
// let format = require('string-format');

let globalEnv = [[],[]];
let tempEnv = [[],[]];
let args = {};
let coded_args = '';
let linesToColour = [];

const parse_arguments = (input) => {
    // console.log(input);
    let parsed_args = esprima.parseScript(input);
    // let parsed_args = esprima.parseScript('(x = 1, y = 2)');
    args = new Map();
    parsed_args.body[0].expression.expressions.map((x) => args.set(x.left.name, x.right.raw));
};
const generate_coded_args = () => {
    for (let [k, v] of args){
        coded_args = format((coded_args + 'let {} = {};\n'), k, v);
    }
};
const clone_env = (env) => {return [env[0].slice(0), env[1].slice(0)];};
const parse_func_decl = (env, parsedObject) =>{
    // let param;
    // for(param in parsedObject.params){
    //     chart.push(new ChartLine(parsedObject.params[param].loc.start.line, 'Variable Declaration', parsedObject.params[param].name, null, null));
    // }
    parseByFunc['BlockStatement'](env, parsedObject.body);
};
const parse_block_statement = (env, parsedObject) => {
    let param;
    for(param in parsedObject.body){
        parseByFunc[parsedObject.body[param].type](env, parsedObject.body[param]);
    }
    parsedObject.body = parsedObject.body.filter((x)=>{return !((x.type == 'VariableDeclaration') || ((x.type == 'ExpressionStatement') && (x.expression.type == 'AssignmentExpression') && !isArgument(x.expression.left)));});
};
const parse_variable_declaration = (env, parsedObject) => {
    let param;
    for(param in parsedObject.declarations){
        if (parsedObject.declarations[param].init == null) {
            env[1].push(null);
            env[0].push(parsedObject.declarations[param].id.name);
        }
        else{
            env[1].push(stringifyExpression[parsedObject.declarations[param].init.type](env, parsedObject.declarations[param].init));
            env[0].push(parsedObject.declarations[param].id.name);
        }
    }
};
const parse_assignment_expression_right_side = (env, parsedObject) => {
    return stringifyExpression[parsedObject.type](env, parsedObject);
};
const binary_exp_to_string = (env, parsedObject) => {
    let result = '';
    let left = stringifyExpression[parsedObject.left.type](env, parsedObject.left);
    let right = stringifyExpression[parsedObject.right.type](env, parsedObject.right);
    result = (parsedObject.operator == '*' || parsedObject.operator == '/') && left.length > 1 ? result + '(' + left + ')' : result + left;
    result = result + parsedObject.operator;
    result = (parsedObject.operator == '*' || parsedObject.operator == '/') && right.length > 1 ? result + '(' + right + ')' : result + right;
    return result;
};
const unary_exp_to_string = (env, parsedObject) => {
    return parsedObject.operator + stringifyExpression[parsedObject.argument.type](env, parsedObject.argument);
};
const parse_expression_statement = (env, parsedObject) => {
    parseByFunc[parsedObject.expression.type](env, parsedObject.expression);
};
const parse_assignment_expression = (env, parsedObject) => {
    let right_side = parseByFunc['AssignmentExpressionRightSide'](env, parsedObject.right);
    parsedObject.right = esprima.parseScript(right_side).body[0].expression;
    env[1].push(parseByFunc['AssignmentExpressionRightSide'](env, parsedObject.right));
    env[0].push(parsedObject.left.name);
};
const parse_while_statement = (env, parsedObject) => {
    let test = stringifyExpression[parsedObject.test.type](env, parsedObject.test);
    parsedObject.test = esprima.parseScript(test).body[0].expression;
    let evaluated_test = test_eval(test);
    evaluated_test ? linesToColour.push(true) : linesToColour.push(false);
    let clonedEnv = clone_env(env);
    parseByFunc[parsedObject.body.type](clonedEnv, parsedObject.body);
    if (evaluated_test) {env[0] = tempEnv[0]; env[1] = tempEnv[1];}
};
const member_exp_to_string = (env, parsedObject) => {
    return '' + parsedObject.object.name + '[' + stringifyExpression[parsedObject.property.type](env, parsedObject.property) + ']';
};
const parse_if_statement = (env, parsedObject) => {
    let test = stringifyExpression[parsedObject.test.type](env, parsedObject.test);
    parsedObject.test = esprima.parseScript(test).body[0].expression;
    let evaluated_test = test_eval(test);
    evaluated_test ? linesToColour.push(true) : linesToColour.push(false);
    let clonedIfEnv = clone_env(env);
    parseByFunc[parsedObject.consequent.type](clonedIfEnv, parsedObject.consequent);
    if (evaluated_test) tempEnv = clonedIfEnv;
    if (parsedObject.alternate != null) {
        let clonedElseEnv = clone_env(env);
        parseByFunc[parsedObject.alternate.type](clonedElseEnv, parsedObject.alternate);
        if (!evaluated_test) {env[0] = clonedElseEnv[0]; env[1] = clonedElseEnv[1];}
    }
    if (evaluated_test) {env[0] = tempEnv[0]; env[1] = tempEnv[1];}
};
const parse_return_statement = (env, parsedObject) => {
    parsedObject.argument = esprima.parseScript(stringifyExpression[parsedObject.argument.type](env, parsedObject.argument)).body[0].expression;
};

const stringify_binary_expression = (env, parsedObject) => {
    return binary_exp_to_string(env, parsedObject);
};
const stringify_literal_expression = (env, parsedObject) => {
    return parsedObject.raw;
};
const stringify_identifier_expression = (env, parsedObject) => {
    let idx = env[0].lastIndexOf(parsedObject.name);
    return idx == -1 ? parsedObject.name : env[1][idx];
};
const stringify_member_expression = (env, parsedObject) => {
    return member_exp_to_string(env, parsedObject);
};
const stringify_unary_expression = (env, parsedObject) => {
    return unary_exp_to_string(env, parsedObject);
};
const stringify_array_expression = (env, parsedObject) => {
    let result = '[';
    for (let i = 0; i < parsedObject.elements.length - 1; i++)
        result = result + parsedObject.elements[i].raw + ',';
    result = result + parsedObject.elements[parsedObject.elements.length - 1].raw + ']';
    return result;
};
const test_eval = (test) => {return eval(coded_args + test);};
const isArgument = (exp) => {
    return exp.type == 'Identifier' && args.has(exp.name);
};
const parseByFunc = {
    'FunctionDeclaration' : parse_func_decl,
    'BlockStatement' : parse_block_statement,
    'VariableDeclaration' : parse_variable_declaration,
    'ExpressionStatement' : parse_expression_statement,
    'AssignmentExpression' : parse_assignment_expression,
    'AssignmentExpressionRightSide' : parse_assignment_expression_right_side,
    'WhileStatement' : parse_while_statement,
    'IfStatement' : parse_if_statement,
    'ReturnStatement' : parse_return_statement,
};
const stringifyExpression = {
    'BinaryExpression' : stringify_binary_expression,
    'Literal' : stringify_literal_expression,
    'Identifier' : stringify_identifier_expression,
    'MemberExpression' : stringify_member_expression,
    'UnaryExpression' : stringify_unary_expression,
    'ArrayExpression' : stringify_array_expression};

const parseCode = (codeToParse, argumentsToUse) => {
    globalEnv = [[],[]];
    tempEnv = [[],[]];
    linesToColour = [];
    coded_args = '';
    parse_arguments(argumentsToUse);
    generate_coded_args();
    let parsedObject = esprima.parseScript(codeToParse, {loc:true});
    parsedObject.body.map((x)=> parseByFunc[x.type](globalEnv, x));
    parsedObject.body = parsedObject.body.filter((x)=>{return !((x.type == 'VariableDeclaration') || ((x.type == 'ExpressionStatement') && (x.expression.type == 'AssignmentExpression') && !isArgument(x.expression.left)));});
    let splittedOutput = escodegen.generate(parsedObject).split('\n');
    let booleanLinesIndex = 0;
    for (let i = 0; i < splittedOutput.length; i++){
        if (splittedOutput[i].includes('if') || splittedOutput[i].includes('while')) {
            linesToColour[booleanLinesIndex] ? splittedOutput[i] = splittedOutput[i].fontcolor('green') : splittedOutput[i] = splittedOutput[i].fontcolor('red');
            booleanLinesIndex++;
        }
    }
    return splittedOutput.join('\n');
};
// parseCode('function foo(x, y, z){\n' +
//     '    let a = x + 1;\n' +
//     '    let b = a + y;\n' +
//     '    let c = 0;\n' +
//     '    \n' +
//     '    if (b < z) {\n' +
//     '        c = c + 5;\n' +
//     '        return x + y + z + c;\n' +
//     '    } else if (b < z * 2) {\n' +
//     '        c = c + x + 5;\n' +
//     '        return x + y + z + c;\n' +
//     '    } else {\n' +
//     '        c = c + z + 5;\n' +
//     '        return x + y + z + c;\n' +
//     '    }\n' +
//     '}\n');

// module.exports = (parseCode);
export {parseCode};
