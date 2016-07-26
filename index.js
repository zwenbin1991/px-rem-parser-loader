/**
 * @file px-rem-parser-loader
 */

'use strict';

var loaderUtils = require('loader-utils');

var prefix = ['-webkit-', '-moz-', '-ms-', '-o-'];
var matchCSSRuleExp = new RegExp(
    [
        '\\s*('+ prefix.join('|') +')?',
        '([\\w-\\s]*?):',
        '\\s*([\\d.]*?)px;',
        '(\\s*\\/\/*([@\w]*?)\\/\\*\\s*)?'
    ].join(''),
    'g'
    );
var startMatchUnremExp = /(^|\s*)\/\*([^*]*?)\*\//i;
var matchPXExp = /\b([\d.]*?)px\b/;
var defaultOption = {
    // 1rem = npx
    rem: 100,

    // 忽略哪些样式
    ignoreCSSProperties: ['background-size', 'background']
};
var __UNREM__ = '@unrem';
var __REM__ = '@rem';
var __UNIT__ = 'rem';

module.exports = function (content) {
    this.cacheable();

    // 如果文件开头包括了@unrem，代表该文件不需要进行px转rem操作
    if (startMatchUnremExp.test(content)
        && RegExp.$1 === __UNREM__)
            return content;

    const query = loaderUtils.parseQuery(this.query);

    return content.replace(matchCSSRuleExp, function (match, prefix, name, value, cmd, cmdValue) {
        // 如果css规则结尾有@
        if (cmd && cmdValue === __UNREM__)
            return match;

        if (defaultOption.ignoreCSSProperties.indexOf(name) && (!cmd || cmdValue !== __REM__))
            return match;

        return match.replace(matchPXExp, function (px, pxValue) {
            return Number((+pxValue / (query && query.rem ? query.rem : defaultOption.rem)).toFixed(4)) + __UNIT__;
        });
    });
};