'use strict';

const RuleTester = require('eslint').RuleTester;
const rules = require('../../').rules;
const ruleTester = new RuleTester();

ruleTester.run('valid-suite-description', rules['valid-suite-description'], {
    valid: [
        {
            options: [ '^[A-Z]' ],
            code: 'describe("This is a test", function () { });'
        },
        {
            options: [ '^[A-Z]' ],
            code: 'context("This is a test", function () { });'
        },
        {
            options: [ '^[A-Z]' ],
            code: 'suite("This is a test", function () { });'
        },
        {
            options: [ '^[A-Z]', [ 'someFunction' ] ],
            code: 'describe("this is a test", function () { });'
        },
        {
            options: [ '^[A-Z]', [ 'someFunction' ] ],
            code: 'someFunction("Should do something", function () { });'
        },
        'someOtherFunction();',
        {
            parserOptions: { ecmaVersion: 2017 },
            options: [ '^Foo' ],
            code: 'describe(`Foo with template strings`, function () {});'
        }

    ],

    invalid: [
        {
            options: [ '^[A-Z]' ],
            code: 'describe("this is a test", function () { });',
            errors: [
                { message: 'Invalid "describe()" description found.' }
            ]
        },
        {
            options: [ '^[A-Z]' ],
            code: 'context("this is a test", function () { });',
            errors: [
                { message: 'Invalid "context()" description found.' }
            ]
        },
        {
            options: [ '^[A-Z]' ],
            code: 'suite("this is a test", function () { });',
            errors: [
                { message: 'Invalid "suite()" description found.' }
            ]
        },
        {
            options: [ '^[A-Z]', [ 'customFunction' ] ],
            code: 'customFunction("this is a test", function () { });',
            errors: [
                { message: 'Invalid "customFunction()" description found.' }
            ]
        }
    ]
});
