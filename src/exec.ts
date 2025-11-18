import child_process from "node:child_process";
import util from "node:util";

import type { Logger } from "./log";
import { trimStr } from "./util";

const execAsync = util.promisify(child_process.exec);

export const prepareExec =
	(log: Logger) =>
	async (cmd: string): Promise<{ stdout: string; stderr: string }> => {
		log.withPrefix(">").info(trimStr(cmd));

		const output = await execAsync(cmd);
		if (output.stderr) {
			throw new Error(trimStr(output.stderr));
		}

		log.withPrefix("<").info(trimStr(output.stdout));
		return output;
	};
