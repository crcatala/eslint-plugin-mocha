'use strict';

var RuleTester = require('eslint').RuleTester,
    rule = require('../../lib/rules/no-setup-in-describe'),
    // ruleTester = new RuleTester(),
    ruleTester = new RuleTester({
        parserOptions: { ecmaVersion: 2017 }
    }),
    memberExpressionError =
        'Unexpected member expression in describe block. ' + 'Member expressions may call functions via getters.';

ruleTester.run('no-setup-in-describe', rule, {
    valid: [
        'it()',
        'it(); it(); it()',
        'a.b',
        'b()',
        'function g() { a() }',
        { code: '() => { a.b }', parserOptions: { ecmaVersion: 6 } },
        'it("", function () { b(); })',
        'it("", function () { a.b; })',
        'it("", function () { a[b]; })',
        'it("", function () { a["b"]; })',
        'describe("", function () { it(); })',
        'describe("", () => { it(); })',
        'describe("", function () { it("", function () { b(); }); })',
        'describe("", function () { it("", function () { a.b; }); })',
        'describe("", function () { it("", function () { a[b]; }); })',
        'describe("", function () { it("", function () { a["b"]; }); })',
        'describe("", function () { function a() { b(); }; it(); })',
        'describe("", function () { function a() { b.c; }; it(); })',
        { code: 'describe("", function () { var a = () => b.c; it(); })', parserOptions: { ecmaVersion: 6 } },
        'describe("", function () { describe("", function () { it(); }); it(); })',
        {
            code: 'foo("", function () { it(); })',
            settings: {
                'mocha/additionalSuiteNames': [ 'foo' ]
            }
        },
        {
            code: 'foo("", function () { it(); })',
            settings: {
                mocha: {
                    additionalSuiteNames: [ 'foo' ]
                }
            }
        },
        {
            code: 'foo("", function () { it("", function () { b(); }); })',
            settings: {
                mocha: {
                    additionalSuiteNames: [ 'foo' ]
                }
            }
        }
    ],

    invalid: [
        {
            code: 'describe("", function () { a(); });',
            errors: [
                {
                    message: 'Unexpected function call in describe block.',
                    line: 1,
                    column: 28
                }
            ]
        },
        {
            code: 'describe("", () => { a(); });',
            errors: [
                {
                    message: 'Unexpected function call in describe block.',
                    line: 1,
                    column: 22
                }
            ]
        },
        {
            code: 'foo("", function () { a(); });',
            settings: {
                mocha: {
                    additionalSuiteNames: [ 'foo' ]
                }
            },
            errors: [
                {
                    message: 'Unexpected function call in describe block.',
                    line: 1,
                    column: 23
                }
            ]
        },
        {
            code: 'foo("", function () { a[b]; });',
            settings: {
                mocha: {
                    additionalSuiteNames: [ 'foo' ]
                }
            },
            errors: [
                {
                    message: memberExpressionError,
                    line: 1,
                    column: 23
                }
            ]
        },
        {
            code: 'foo("", function () { a["b"]; });',
            settings: {
                mocha: {
                    additionalSuiteNames: [ 'foo' ]
                }
            },
            errors: [
                {
                    message: memberExpressionError,
                    line: 1,
                    column: 23
                }
            ]
        },
        {
            code: 'describe("", function () { a.b; });',
            errors: [
                {
                    message: memberExpressionError,
                    line: 1,
                    column: 28
                }
            ]
        },
        {
            code: 'foo("", function () { a.b; });',
            settings: {
                mocha: {
                    additionalSuiteNames: [ 'foo' ]
                }
            },
            errors: [
                {
                    message: memberExpressionError,
                    line: 1,
                    column: 23
                }
            ]
        }
    ]
});
