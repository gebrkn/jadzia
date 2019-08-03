let fs = require('fs');
let jadzia = require('../js');


function example(t, lang1, lang2) {
    t = t.trim();
    let r = eval(t);
    let qq = "```";
    return [
        '###### example:',
        qq + lang1,
        t,
        qq,
        '###### output:',
        qq + lang2,
        r,
        qq
    ].join('\n')

}


let text = fs.readFileSync(__dirname + '/README.md', 'utf8');

text = text.replace(
    /`{3}JS([\s\S]+?)`{3}/g,
    (_, t) => example(t, 'javascript', 'javascript')
);

text = text.replace(
    /`{3}CSS([\s\S]+?)`{3}/g,
    (_, t) => example(t, 'javascript', 'css')
);

fs.writeFileSync(__dirname + '/../README.md', text, 'utf8');


