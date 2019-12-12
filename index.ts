
import {spawn, spawnSync} from "child_process";
import {Plugin} from "rollup";

export default (commands: string[] | string, sync = false): Plugin => {
    const commandsArr = typeof commands === "string" ? [commands] : commands;
    if (!Array.isArray(commandsArr)) {
        throw new Error("Command(s) should be a string or an array");
    }

    return {
        name: "execute",
        generateBundle() {
            const copy = commandsArr.slice(0);
            const next = () => {
                const command = copy.shift();
                if (!command) {
                    return;
                }

                if (sync === true) {
                    const ret = spawnSync(command, {
                        env: process.env,
                        shell: true,
                        stdio: "inherit",
                    });
                    if (ret.status === 0) {
                        next();
                    }
                } else {
                    spawn(command, {
                        env: process.env,
                        shell: true,
                        stdio: "inherit",
                    }).on("close", (code) => {
                        if (code === 0) {
                            next();
                        }
                    });
                }

            };
            next();
        },
    };
};
