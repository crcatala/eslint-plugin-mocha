'use strict';

var astUtils = require('../util/ast'),
    additionalSuiteNames = require('../util/settings').additionalSuiteNames;

module.exports = function noSetupInDescribe(context) {
    var nesting = [],
        settings = context.settings,
        FUNCTION = 1,
        DESCRIBE = 2,
        VARIABLE_DECLARATOR = 3,
        // "Pure" nodes are hooks (like `beforeEach`) or `it` calls
        PURE = 3;

    function isPureNode(node) {
        return astUtils.isHookIdentifier(node) || astUtils.isTestCase(node);
    }

    function reportCallExpression(callExpression) {
        console.log('reportCallExpression');
        // console.log('reportCallExpression - callExpression.callee', callExpression.callee);
        console.log('reportCallExpression - callExpression.callee.name', callExpression.callee.name);
        var message = 'Unexpected function call in describe block.';

        context.report({
            message: message,
            node: callExpression.callee
        });
    }

    function reportMemberExpression(memberExpression) {
        var message =
            'Unexpected member expression in describe block. ' + 'Member expressions may call functions via getters.';

        context.report({
            message: message,
            node: memberExpression
        });
    }

    function isNestedInDescribeBlock() {
        console.log('isNestedInDescribeBlock');
        console.log('isNestedInDescribeBlock nesting', nesting);
        console.log('isNestedInDescribeBlock - nesting.length', nesting.length);
        console.log('isNestedInDescribeBlock - nesting.indexOf(PURE)', nesting.indexOf(PURE));
        console.log('isNestedInDescribeBlock - nesting.lastIndexOf(FUNCTION)', nesting.lastIndexOf(FUNCTION));
        console.log('isNestedInDescribeBlock - nesting.lastIndexOf(DESCRIBE)', nesting.lastIndexOf(DESCRIBE));
        return (
            nesting.length &&
            nesting.indexOf(PURE) === -1 &&
            nesting.lastIndexOf(FUNCTION) < nesting.lastIndexOf(DESCRIBE)
        );
    }

    function handleCallExpressionInDescribe(node) {
        console.log('handleCallExpressionInDescribe');
        if (isPureNode(node)) {
            console.log('handleCallExpressionInDescribe - isPureNode');
            nesting.push(PURE);
        } else if (isNestedInDescribeBlock()) {
            console.log('handleCallExpressionInDescribe - isNestedInDescribeBlock');
            reportCallExpression(node);
        }
    }

    return {
        CallExpression: function (node) {
            console.log('CallExpression');
            var isDescribe = astUtils.isDescribe(node, additionalSuiteNames(settings));
            if (isDescribe) {
                nesting.push(DESCRIBE);
                return;
            }
            // don't process anything else if the first describe hasn't been processed
            if (!nesting.length) {
                return;
            }
            handleCallExpressionInDescribe(node);
        },

        'CallExpression:exit': function (node) {
            if (astUtils.isDescribe(node) || nesting.length && isPureNode(node)) {
                nesting.pop();
            }
        },

        MemberExpression: function (node) {
            console.log('MemberExpression');
            if (isNestedInDescribeBlock()) {
                reportMemberExpression(node);
            }
        },

        FunctionDeclaration: function () {
            console.log('FunctionDeclaration');
            if (nesting.length) {
                nesting.push(FUNCTION);
            }
        },
        'FunctionDeclaration:exit': function () {
            if (nesting.length) {
                nesting.pop();
            }
        },

        // FunctionExpression: function () {
        //     console.log('FunctionExpression');
        //     if (nesting.length) {
        //         nesting.push(FUNCTION);
        //     }
        // },
        // 'FunctionExpression:exit': function () {
        //     if (nesting.length) {
        //         nesting.pop();
        //     }
        // },
        ArrowFunctionExpression: function () {
            console.log('ArrowFunctionExpression');
            if (nesting.length && nesting[nesting.length - 2] === DESCRIBE) {
                nesting.push(FUNCTION);
            }
        },
        'ArrowFunctionExpression:exit': function () {
            console.log('ArrowFunctionExpression:exit');
            if (nesting.length) {
                console.log('ArrowFunctionExpression:exit - about to pop()');
                nesting.pop();
            }
        },
        MethodDefinition: function () {
            console.log('MethodDefinition');
            // if (nesting.length && nesting[nesting.length - 2] === DESCRIBE) {
            //     nesting.push(FUNCTION);
            // }
        },
        'MethodDefinition:exit': function () {
            console.log('MethodDefinition:exit');
            // if (nesting.length) {
            //     console.log('ArrowFunctionExpression:exit - about to pop()');
            //     nesting.pop();
            // }
        },
        VariableDeclarator: function () {
            console.log('VariableDeclarator');
            if (nesting.length) {
                nesting.push(VARIABLE_DECLARATOR);
            }
        },
        'VariableDeclarator:exit': function () {
            console.log('VariableDeclarator:exit');
            if (nesting.length) {
                nesting.pop();
            }
        }
    };
};
