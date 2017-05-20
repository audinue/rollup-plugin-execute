
var spawn = require('child_process').spawn

function execute (options) {
    if (typeof options == 'string' || Array.isArray(options)) {
        options = {
            commands: options
        }
    }
    // assume typeof options == 'object'
    if (typeof options.commands == 'string') {
        options.commands = [options.commands]
    }
    options = Object.assign({
        on: 'generate' // or 'write'
    }, options)
    var commands = options.commands
    var executeCommands = function () {
        var copy = commands.slice(0)
        var next = function () {
            var command
            if (!(command = copy.shift())) {
                return
            }
            spawn(command, {
                shell: true,
                stdio: 'inherit',
                env: process.env
            }).on('close', function (code) {
                if (code === 0) {
                    next()
                }
            })
        }
        next()
    }
    return {
        name: 'execute',
        ongenerate: function () {
            if (options.on == 'generate') {
                executeCommands()
            }
        },
        onwrite: function () {
            if (options.on == 'write') {
                executeCommands()
            }
        }
    }
}

module.exports = execute
