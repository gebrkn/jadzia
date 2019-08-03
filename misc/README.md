# jadzia

`jadzia` generates css from javascript objects.

```CSS
let rule = {
    '#headline': {
        width: 300,
        paddingLeft: 5,

        'div': {
            font: [12, 'Arial'],
        },

        '&.active': {
            color: 'cyan',
            ':hover': {
                color: 'blue'
            }
        }
    }
}

jadzia.css(rule)
```

`jadzia` is useful if you (like me):

- write lots of complex and highly parametrized CSS
- know javascript and don't want to learn ad-hoc CSS languages
- like to be framework-agnostic and keep CSS where it belongs: in .css files

## input

`jadzia`'s input is a `rule`, which is an object containing css properties.
You can also pass an array of such objects or a function that returns such an object.

A rule can also contain other nested rules with their respective selectors.

```CSS
let rule = {
    '#headline': {
        // css props
        width: 300,
        paddingLeft: 5,

        // nested rule
        'div': {
            font: [12, 'Arial'],

            // another nested rule
            '.important': {
                fontWeight: 800
            }
        }
    }
}

jadzia.css(rule)
```

### selectors

Selectors are just like css selectors. If a nested selector starts with an `&` or `:`, it's merged with the parent selector.
For comma-separated nested selectors, `jadzia` creates all possible combinations of them.
Selectors that end with an `&` are prepended to the parent.

```CSS
let rule = {
    '#headline': {
        width: 300,
        paddingLeft: 5,

        // simple sub-selector
        'div': {
            font: [12, 'Arial'],
        },

        // merge with parent
        '&.active': {
            color: 'cyan'
        },

        // prepend to parent
        '.dark-theme&': {
            color: 'black'
        },

        // create combinations
        'em, strong': {
            opacity: 0.3
        }
    }
}

jadzia.css(rule)
```

### media selectors

Media selectors are moved to the topmost level and merged.

```CSS
let rule = {
    '#headline': {
        '@media screen': {
            '@media (max-width: 800px)': {
                width: 800,
            }
        },
        '@media print': {
            display: 'none'
        }
    },
    article: {
        '@media screen and (max-width: 800px)': {
            width: '100%',
        },
        '@media print': {
            fontSize: 11
        }
    }
}

jadzia.css(rule)
```

### property names

CSS property names can be quoted, or written with an underscore instead of a dash, or in camelCase:

```CSS
let rule = {
    '#headline': {
        paddingLeft: 5,
        padding_top: 10,
        'padding-bottom': 20,
        _webkitTransition: 'all 4s ease',
    }
}

jadzia.css(rule)
```

### property values

A property value can be:

- a string, which is taken as is
- an _empty_ string, which will appear in css as `''` (useful for `content` props)
- a number, the default unit will be added if required
- an array, which will appear space-joined
- `null`, in which case the property will be removed (useful when extending base rules)
- a function returning one of the above

```CSS
const minMargin = 5;

const baseBlock = {
    display: 'block',
    opacity: 0.3,
    background: 'cyan',
}

let rule = {
    '#headline': {
        paddingLeft: 5,
        color: 'cyan',
        border: [1, 'dotted', 'white'],

        margin: () => [1, 3].map(x => x + minMargin),
        content: '',

        ...baseBlock,
        background: null,
    }
}

jadzia.css(rule)
```

## API

```
jadzia.css(rules, options)
```
takes `rules` and returns formatted CSS.

```
jadzia.object(rules, options)
```
takes `rules` and returns a normalized CSS object.

```
jadzia.format(object, options)
```
formats a normalized object into CSS.


```JS
let rule = {
    '#headline': {
        width: 300,
        paddingLeft: 5,

        'div': {
            font: [12, 'Arial'],
        }
    }
}

JSON.stringify(jadzia.object(rule), null, 4)
```


The options are:

option|    |default
------|----|----
`customs` | list of custom properties that should be preceded with two dashes | `[]`
`indent` | indentation for the generated CSS | `4`
`sort` | sort selectors and property values | `false`
`unit` | default unit for numeric values | `px`

```CSS
let rule = {
    '#headline': {
        zIndex: 3,
        padding: 5,
        mainBgColor: 'cyan'
    }
}

jadzia.css(rule, {
    unit: 'em',
    indent: 2,
    sort: true,
    customs: ['main-bg-color'],
})
```

`options` are passed to selector and property functions. You can put your own values there for CSS parametrization:


```CSS
let rule = options => ({
    '#headline': {
        width: 300,
        color: options.textColor,
        border: [1, 'dotted', options.borderColor],
    }
});

jadzia.css(rule, {
    textColor: '#cc0000',
    borderColor: 'cyan'
})
```

## info

(c) 2019 Georg Barikin (https://github.com/gebrkn). MIT license.


