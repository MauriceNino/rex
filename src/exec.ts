import child_process from 'child_process';
import util from 'util';

import { Logger } from './log';
import { trimStr } from './util';

const execp = util.promisify(child_process.exec);

export const prepareExec =
  (log: Logger) =>
  async (cmd: string): Promise<{ stdout: string; stderr: string }> => {
    log.withPrefix('>').info(trimStr(cmd));

    const output = await execp(cmd);
    if (output.stderr) {
      throw new Error(trimStr(output.stderr));
    }

    log.withPrefix('<').info(trimStr(output.stdout));
    return output;
  };
