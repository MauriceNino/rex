import chalk from 'chalk';
import express from 'express';
import fs from 'fs';
import path from 'path';

import { CONFIG } from './config';
import { prepareExec } from './exec';
import { log, Logger } from './log';
import { RouteBuilder } from './route-builder';

const app = express();

if (!CONFIG.script_path) {
  log.error('REX_SCRIPT_PATH needs to be provided');
  process.exit(1);
}
if (!CONFIG.secret) {
  log.error('REX_SECRET needs to be provided');
  process.exit(1);
}

fs.readdir(CONFIG.script_path, (err, files) => {
  files.forEach(file => {
    const serviceName = path.parse(file).name;
    const scriptPath = path.join(CONFIG.script_path!, file);

    app.get(`/${serviceName}`, async (req, res) => {
      const logger = new Logger({
        preserveLogs: true,
      });

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require(`${scriptPath}`)({
        route: new RouteBuilder(req, res, logger),
        exec: prepareExec(logger),
        log: logger,
      });
    });

    log.info(`registered endpoint ${chalk.green(serviceName)}`);
  });
  log.info('-'.repeat(30));
});

app.listen(CONFIG.port, function () {
  log.info(`rex is listening on port ${chalk.yellow(CONFIG.port)}`);
});

process.on('uncaughtException', e => {
  log.error(e);
  process.exit(1);
});

process.on('unhandledRejection', function (e, p) {
  log.error(e);
  process.exit(1);
});
