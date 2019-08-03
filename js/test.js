let s = require('./index');

let tests = [

    function () {
        let i = {
            b: {
                color: 'blue',
                '.aa': {
                    color: 'cyan'
                },
                '.bb': {
                    color: 'red'
                }
            }
        };

        _t('nested child selectors', s.css(i), `
            b { color: blue; }
            b .aa { color: cyan; } 
            b .bb { color: red; }
        `)
    },

    function () {
        let i = {
            'b, i': {
                '.aa, .bb': {
                    border: 0
                },
            }
        };
        _t('nested comma selectors', s.css(i), `
            b .aa { border: 0; } 
            b .bb { border: 0; } 
            i .aa { border: 0; } 
            i .bb { border: 0; }
        `)
    },

    function () {
        let i = {
            'main': {
                '.sub, &.sticky': {
                    border: 0
                },
            }
        };
        _t('nested sticky selectors', s.css(i), `
            main .sub { border: 0; } 
            main.sticky { border: 0; }
        `)
    },

    function () {
        let i = {
            b: {
                color: 'blue',
                '': {
                    margin: '0'
                },
                '.bb': {
                    margin: '1'
                }
            }
        };
        _t('nested empty selectors', s.css(i), `
            b { color: blue; margin: 0; }
            b .bb { margin: 1; }
        `)
    },

    function () {
        let i = {
            'b': {
                ':hover': {
                    border: '1'
                },
                '::after': {
                    border: '2'
                },
            }
        };
        _t('nested pseudo classes', s.css(i), `
            b:hover { border: 1; } b::after { border: 2; } 
        `)
    },

    function () {
        let i = {
            'main': {
                'sub': {
                    'subsub, inter&': {
                        border: 0
                    },
                }
            }
        };
        _t('nested parent selectors', s.css(i), `
            main sub subsub { border: 0; }
            main inter sub { border: 0; } 
        `)
    },

    function () {
        let i = {
            'b': {
                '.c': {
                    border: 0
                },
            },
            'b, i': {
                '.c': {
                    color: 'red'
                },
            },
            'i, b': {
                '.c': {
                    margin: 0
                },
            }
        };
        _t('disjoint rules', s.css(i), `
            b .c { border: 0; color: red; margin: 0; } 
            i .c { color: red; margin: 0; }
        `)
    },

    function () {
        let i = {
            '@media screen and (min-width: 900px)': {
                'b': {
                    border: 0
                },
            }
        };
        _t('media queries', s.css(i), `
            @media screen and (min-width: 900px) { 
                b { border: 0; } 
            }
        `)
    },

    function () {
        let i = {
            '@media screen': {
                '@media (min-width: 900px)': {
                    'b': {
                        border: 0
                    }
                },
            }
        };
        _t('nested media queries', s.css(i), `
            @media screen and (min-width: 900px) { 
                b { border: 0; } 
            }
        `)
    },

    function () {
        let i = {
            'b': {
                'i': {
                    '@media screen and (min-width: 900px)': {
                        border: 0
                    }
                },
            }
        };
        _t('media moved forward', s.css(i), `
            @media screen and (min-width: 900px) { 
                b i { border: 0; } 
            }
        `)
    },

    function () {
        let i = {
            b: {
                __custom: 'green',
                _mozBackgroundColor: 'blue',
                backgroundColor: 'red',

            }
        };
        _t('property names converted', s.css(i), `
            b { --custom: green; -moz-background-color: blue; background-color: red; }
        `)
    },

    function () {
        let i = {
            b: {
                '--custom': 'green',
                '-moz-background-color': 'blue',
                'background-color': 'red',

            }
        };
        _t('verbatim property names', s.css(i), `
            b { --custom: green; -moz-background-color: blue; background-color: red; }
        `)
    },

    function () {
        let i = {
            b: {
                '--custom': 'green',
                'customTwo': 'blue',

            }
        };
        _t('configurable custom props', s.css(i, {customs: ['custom-one', 'custom-two']}), `
            b { --custom: green; --custom-two: blue; }
        `)
    },

    function () {
        let i = {
            b: {
                margin: 3,
            }
        };
        _t('default unit added', s.css(i), `
            b { margin: 3px; }
        `)
    },

    function () {
        let i = {
            b: {
                margin: 3,
            }
        };
        _t('configurable default unit', s.css(i, {unit: 'em'}), `
            b { margin: 3em; }
        `)
    },

    function () {
        let i = {
            b: {
                margin: '3foo',
            }
        };
        _t('string values as is', s.css(i), `
            b { margin: 3foo; }
        `)
    },

    function () {
        let i = {
            b: {
                flex: 5,
                lineHeight: 32,
            }
        };
        _t('unitless props', s.css(i), `
            b { flex: 5; line-height: 32; }
        `)
    },

    function () {
        let i = {
            b: {
                border: [1, 'solid', 'red'],
            }
        };
        _t('array values', s.css(i, {unit: 'em'}), `
            b { border: 1em solid red; }
        `)
    },

    function () {
        let i = {
            b: {
                i: {
                    '@keyframes hey': {
                        from: {marginTop: '1'},
                        '50%': {marginTop: '2'},
                    }
                }
            }
        };
        _t('@rules no prefix', s.css(i), `
            @keyframes hey { from { margin-top: 1; } 50% { margin-top: 2; } }
        `)
    },

    function () {
        let i = {
            b: [
                {
                    i: {
                        color: 'red'
                    }
                },
                [
                    {
                        i: {
                            padding: ['3']
                        }
                    },
                ]
            ]
        };
        _t('array rules', s.css(i), `
            b i { color: red; padding: 3; }
        `)
    },

    function () {
        let i = {
            b: [
                opts => ({
                    i: {
                        color: opts.COLOR
                    }
                }),
            ],
            i: opts => opts.RULE

        };
        _t('function rules', s.css(i, {COLOR: 'blue', RULE: {margin: '33'}}), `
            b i { color: blue; } 
            i { margin: 33; }
        `)
    },
];


//


let pass = 0, fail = 0;

function _t(name, x, y) {

    x = x.replace(/\s+/g, ' ').trim();
    y = y.replace(/\s+/g, ' ').trim();

    if (x === y) {
        pass++;
        return
    }

    fail++;

    console.log('\nFAILED:', name);
    console.log('  a>', x);
    console.log('  e>', y);
}

tests.forEach(t => t());

let msg = 'tests=' + (pass + fail) + ' pass=' + pass;
if (fail)
    msg += ' FAIL=' + fail;

console.log('\n' + msg);
