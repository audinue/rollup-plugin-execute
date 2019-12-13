# rollup-plugin-execute

Execute shell command(s) sequentially when the bundle is generated.

```
npm i rollup-plugin-execute -D
```

## Examples

```javascript
// rollup.config.js
import execute from 'rollup-plugin-execute'

export default {
    entry: 'src/app.js',
    dest: 'public/app.js',
    plugins: [
        // Open the browser when the bundle is generated
        execute('start chrome --new-window http://localhost/')
    ]
}
```

```javascript
// rollup.config.js
import execute from 'rollup-plugin-execute'
import path from 'path'

export default {
    entry: 'src/app.js',
    dest: 'public/app.js',
    plugins: [
        execute([
            // Copy index.html from src to public if index.html is not modified
            'robocopy src public index.html',
            // Then open the browser
            'start firefox -new-window "' + path.join(process.cwd(), 'public', 'index.html') + '"'
        ], {
            sync: true,
            hooks: ['generateBundle', 'writeBundle'],
        })
    ]
}
```

## Options

Additionally to the scripts array, a 2nd optional object parameter is accepted. It can have the following properties:

* **sync** (*optional*, defaults to `false`): set it to `true` to execute scripts in a blocking-way.
* **hooks** (*optional*, defaults to `["generateBundle"]`): One or an array of [valid hook names](https://rollupjs.org/guide/en/#hooks) to execute scripts on. For instance, if you want to use it as an output plugin (executed at the total end of the build), use the [`"writeBundle"` hook](https://rollupjs.org/guide/en/#writebundle).

Enjoy!
