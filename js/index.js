//

module.exports.css = function css(rules, options) {
    options = _defopts(options);
    return _format(_parse(rules, options), options);
};

module.exports.object = function object(rules, options) {
    return _parse(rules, _defopts(options));
};

module.exports.format = function format(obj, options) {
    return _format(obj, _defopts(options));
};

//

const _defaults = {
    unit: 'px',
    sort: false,
    indent: 4,
    customs: null,
};

function _defopts(options) {
    return Object.assign({}, _defaults, options || {});
}

function _parse(rules, options) {

    // first, flatten the nested structure, e.g. [ {a:{b:{c:val}}} ]....
    // into a list {selector, prop, value}, e.g. {selector: [a,b], prop: c, value: val}

    let flat = _flatten(rules, options);


    // move media selectors forward and merge others
    // (eg ["foo", "&.bar", "baz", "@media blah"] => ["@media blah", "foo.bar baz"])

    _each(flat, item => item.selector = _parseSelector(item.selector));

    // convert the flat structure back to a nested object

    let obj = _unflatten(flat, options);

    // sort by selector/property name

    if (options.sort) {
        obj = _sort(obj);
    }

    return obj;
}


function _flatten(rules, options) {

    let res = [];

    let walk = (obj, keys) => {
        while (_type(obj) === T_FUNCTION) {
            obj = obj(options);
        }

        if (_type(obj) === T_NULL) {
            return;
        }

        if (_type(obj) === T_ARRAY) {
            _each(obj, x => walk(x, keys));
            return;
        }

        if (_type(obj) === T_OBJECT) {
            _each(obj, (val, key) => {
                _each(_split(key), k => walk(val, keys.concat(k)));
            });
            return;
        }

        res.push({
            selector: keys.slice(0, -1),
            prop: keys[keys.length - 1],
            value: obj
        })
    };

    walk(rules, []);
    return res;
}


function _parseSelector(sel) {
    let r = {
        at: [],
        media: [],
        prepend: [],
        rest: []
    };

    function merge(sel) {
        sel = sel.join('\x01');
        sel = sel.replace(/\x01&\s*/g, '');
        sel = sel.replace(/\x01:\s*/g, ':');
        sel = sel.replace(/\x01/g, ' ');
        return sel;
    }

    _each(sel, s => {
        if (_startsWith(s, '@media')) {
            r.media.push(_trim(s.replace(/^@media/, '')));
            return;
        }

        if (_startsWith(s, '@')) {
            // remove everything before an at-rule
            r.rest = [];
            r.at.push(s);
            return;
        }

        if (_endsWith(s, '&')) {
            if (r.rest.length > 0) {
                let last = r.rest.pop();
                r.rest.push(_trim(s.slice(0, -1)));
                r.rest.push(last);
            }
            return;
        }

        r.rest.push(s);
    });

    let res = [];

    if (r.media.length > 0) {
        res.push('@media ' + r.media.join(' and '));
    }

    if (r.at.length > 0) {
        res = res.concat(r.at);
    }

    res.push(_trim(r.prepend.join(' ') + ' ' + merge(r.rest)));

    return res.filter(Boolean);
}


function _sort(obj) {
    let cmp = (a, b) => (a > b) - (a < b);

    function weight(s) {
        if (!s) return '00';

        if (s[0] === '*') return '10';
        if (s[0] === '#') return '20';
        if (s[0] === '.') return '30';
        if (s[0] === '[') return '40';
        if (s[0] === '@') return '90';

        return '15';
    }

    function byWeight(a, b) {
        return cmp(weight(a) + a, weight(b) + b);
    }

    let r = {};

    _each(Object.keys(obj).sort(byWeight), k => {
        let v = obj[k];
        if (_type(v) === T_OBJECT)
            v = _sort(v);
        r[k] = v;
    });

    return r;
}

function _unflatten(flat, options) {
    let res = {};


    _each(flat, c => {

        let cur = res;

        _each(c.selector, sel => {
            switch (_type(cur[sel])) {
                case T_NULL:
                    cur[sel] = {};
                    cur = cur[sel];
                    return;
                case T_OBJECT:
                    cur = cur[sel];
                    return;
                default:
                    throw new Error('nesting error');
            }
        });

        let name = _propName(c.prop, options);
        let value = _propValue(c.value, name, options);

        if (_type(value) !== T_NULL)
            cur[name] = value;
    });

    return res;
}

function _format(obj, options) {
    let lines = [];
    let indent = Number(options.indent) || 0;

    function write(val, key, level) {
        let ind = _repeat(' ', level * indent);

        if (_type(val) !== T_OBJECT) {
            lines.push(ind + key + ': ' + val + ';');
            return;
        }
        lines.push(ind + key + ' {');
        _each(val, (v, k) => write(v, k, level + 1));
        lines.push(ind + '}');
    }

    _each(obj, (v, k) => write(v, k, 0));
    return lines.join('\n');
}

// from https://github.com/rofrischmann/unitless-css-property/blob/master/modules/index.js

const _unitless = [
    'animationIterationCount',
    'borderImageOutset',
    'borderImageSlice',
    'borderImageWidth',
    'boxFlex',
    'boxFlexGroup',
    'boxOrdinalGroup',
    'columnCount',
    'fillOpacity',
    'flex',
    'flexGrow',
    'flexNegative',
    'flexOrder',
    'flexPositive',
    'flexShrink',
    'floodOpacity',
    'fontWeight',
    'gridColumn',
    'gridRow',
    'lineClamp',
    'lineHeight',
    'opacity',
    'order',
    'orphans',
    'stopOpacity',
    'strokeDasharray',
    'strokeDashoffset',
    'strokeMiterlimit',
    'strokeOpacity',
    'strokeWidth',
    'tabSize',
    'widows',
    'zIndex',
    'zoom',
];

const _vendors = ['webkit', 'moz', 'ms', 'o'];

function _propToCSS(key) {
    return String(key)
        .replace(/[A-Z]/g, '-$&')
        .replace(/_/g, '-')
        .toLowerCase();
}


function _isUnitless(name) {
    if (!_unitless.cache) {
        _unitless.cache = {};
        _each(_unitless, key => {
            let n = _propToCSS(key);
            _unitless.cache[n] = 1;
            _each(_vendors, v => _unitless.cache['-' + v + '-' + n] = 1);
        })
    }

    return (name in _unitless.cache);
}

function _propName(key, options) {
    let name = _propToCSS(key);
    if (options.customs && options.customs.includes(name)) {
        name = '--' + name;
    }
    return name;
}

function _propValue(val, name, options) {
    if (_type(val) === T_NULL)
        return null;

    if (_type(val) === T_SIMPLEARRAY)
        val = _trim(val.map(v => _propValue(v, name, options)).join(' '));

    if (val === '')
        return "''";

    if (_type(val) === T_NUMBER && val !== 0 && !_isUnitless(name))
        return String(val) + options.unit;

    return String(val);
}

function _each(obj, fn) {
    let t = _type(obj);

    if (t === T_ARRAY || t === T_SIMPLEARRAY) {
        obj.forEach(fn);
    } else if (t === T_OBJECT) {
        Object.keys(obj).forEach(k => fn(obj[k], k));
    }
}

function _split(x) {
    x = String(x);

    // for empty child selectors
    if (x.length === 0) {
        return [''];
    }

    return x.split(',').map(_trim).filter(Boolean);
}


function _trim(x) {
    return String(x).trim();
}

function _startsWith(x, y) {
    return String(x).indexOf(y) === 0;
}

function _endsWith(x, y) {
    x = String(x);
    y = String(y);
    return x.slice(x.length - y.length) === y;

}

function _repeat(s, n) {
    let t = '';
    while (n--) {
        t += s;
    }
    return t;
}


const T_ARRAY = 1;
const T_BOOLEAN = 2;
const T_FUNCTION = 3;
const T_NULL = 4;
const T_NUMBER = 5;
const T_OBJECT = 6;
const T_SIMPLEARRAY = 7;
const T_STRING = 8;
const T_SYMBOL = 9;


function _type(v) {
    function isprim(v) {
        let t = typeof v;
        return t === 'number' || t === 'bigint' || t === 'string' || t === 'boolean';
    }

    let t = typeof v;

    if (v === null || t === 'undefined') {
        return T_NULL;
    }

    if (Array.isArray(v)) {
        if (v.length === 0) {
            return T_NULL;
        }
        if (v.every(isprim)) {
            return T_SIMPLEARRAY;
        }
        return T_ARRAY;
    }

    switch (t) {
        case 'string':
            return T_STRING;
        case 'object':
            return (Object.keys(v).length === 0) ? T_NULL : T_OBJECT;
        case 'boolean':
            return T_BOOLEAN;
        case 'bigint':
        case 'number':
            return T_NUMBER;
        case 'function':
            return T_FUNCTION;
        case 'symbol':
            return T_SYMBOL;
    }
}
