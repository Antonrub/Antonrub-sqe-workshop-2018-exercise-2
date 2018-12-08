import $ from 'jquery';
import {parseCode} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let codeToUse = $('#argumentsPlaceholder').val();
        let parsedCode = parseCode(codeToParse, codeToUse);
        document.getElementById('parsedCode').innerHTML = parsedCode;
    });
});