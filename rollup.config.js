
import execute from '.'

export default {
    entry: 'foo.js',
    dest: 'foo-bundle.js',
    plugins: [
        execute({
            on: 'write',
            commands: 'del foo-bundle.js'
        })
    ]
}
