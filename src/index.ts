import express from 'express';
import fs from 'fs';
import path from 'path';

import { CONFIG } from './config';
import { RouteBuilder } from './route-builder';

const app = express();

if (!CONFIG.script_path) {
  throw new Error('REX_SCRIPT_PATH needs to be provided');
}
if (!CONFIG.secret) {
  throw new Error('REX_SECRET needs to be provided');
}

fs.readdir(CONFIG.script_path, (err, files) => {
  files.forEach(file => {
    const serviceName = path.parse(file).name;
    const scriptPath = path.join(CONFIG.script_path!, file);

    console.log(`registered endpoint ${serviceName}`);
    app.get(`/${serviceName}`, async (req, res) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      await require(`${scriptPath}`)({ route: new RouteBuilder(req, res) });
    });
  });
});

app.listen(CONFIG.port, function () {
  console.log(`rex is listening on port ${CONFIG.port}`);
});
