
var spawn = require('child_process').spawn
var spawnSync = require('child_process').spawnSync

// List of hooks usable in rollup
const VALID_HOOKS = [
  'augmentChunkHash',
  'generateBundle',
  'outputOptions',
  'renderChunk',
  'renderError',
  'renderStart',
  'resolveDynamicImport',
  'resolveFileUrl',
  'writeBundle',
];
const DEFAULT_OPTIONS = { sync: false, hooks: ['generateBundle'] };
// Convert & default options
const transformOptions = options => {
  if (options === undefined) {
    return DEFAULT_OPTIONS;
  } else if (typeof options !== 'object') {
    // cast sync as boolean
    const sync = !!options;
    console.warn(`rollup-plugin-execute: 2nd parameter of the "execute" plugin should be an object. Please use "{sync:${sync}}" instead.`);
    return { ...DEFAULT_OPTIONS, sync };
  } else {
    const sync = options.sync === true;

    if (typeof options.hooks === 'string') {
      return {
        sync,
        hooks: [options.hooks]
      }
    } else if (Array.isArray(options.hooks)) {
      const hooksValidated = options.hooks.filter(hook => {
        if (!VALID_HOOKS.includes(hook)) {
          console.error(`rollup-plugin-execute: Unknown or deprecated hook "${hook}". See https://rollupjs.org/guide/en/#hooks for a list of hooks you can use.`);
          return false;
        }
        return true;
      });
      // If an empty array is provided, or some hook names are invalid, throw an error.
      if (hooksValidated.length < 1 || hooksValidated.length !== options.hooks.length) {
        throw new TypeError('`hooks` option must be a non-empty array of valid hook names. See https://rollupjs.org/guide/en/#hooks for a list of hooks you can use.');
      }
      return {
        sync,
        hooks: hooksValidated,
      }
    } else if (options.hooks === undefined) {
      return { ...DEFAULT_OPTIONS, sync };
    } else {
      throw new TypeError('`hooks` option is invalid. It should be either omitted, or a valid hook name, or an array of valid hook names. See https://rollupjs.org/guide/en/#hooks for a list of hooks you can use.');
    }
  }
}

function execute(commands, options) {
  const { sync, hooks } = transformOptions(options);
  if (typeof commands === 'string') {
    commands = [commands]
  }
  if (!Array.isArray(commands)) {
    throw new TypeError('Command(s) should be a string or an array')
  }

  function executeHook() {
    var copy = commands.slice(0)
    var next = function () {
      var command
      if (!(command = copy.shift())) {
        return
      }

      if (sync) {
        let ret = spawnSync(command, {
          shell: true,
          stdio: 'inherit',
          env: process.env
        })
        if (ret.status === 0) {
          next()
        }
      } else {
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

    }
    next()
  }

  return {
    ...Object.fromEntries(hooks.map(hook => [hook, executeHook])),
    name: 'execute',
  };
}

module.exports = execute
