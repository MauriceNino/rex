import chalk from 'chalk';
import util from 'util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Accepted = any;

export class Logger {
  private settings = {
    prefix: '',
    preserveLogs: false,
  };
  private logsCache = new Array<string>();

  constructor(settings?: { prefix?: string; preserveLogs?: boolean }) {
    this.settings = {
      ...this.settings,
      ...settings,
    };
  }

  private setLogsCache(cache: string[]) {
    this.logsCache = cache;
  }

  getLogs() {
    return this.logsCache;
  }

  withPrefix(prefix: string) {
    const newLogger = new Logger({
      ...this.settings,
      prefix: prefix,
    });
    newLogger.setLogsCache(this.logsCache);

    return newLogger;
  }

  private log(entries: string[]) {
    entries.forEach(entry => process.stdout.write(`${entry}\n`));
    if (this.settings.preserveLogs) {
      this.logsCache.push(...entries);
    }
  }

  private static toLogEntry(msg: Accepted[]) {
    return msg
      .map(m =>
        typeof m === 'object'
          ? util.inspect(m, {
              depth: 4,
              colors: true,
              breakLength: Infinity,
            })
          : m
      )
      .join(' ');
  }

  private toLogEntries(prefix: string, msg: Accepted[]): string[] {
    const message = Logger.toLogEntry(msg);

    return message
      .split('\n')
      .map(
        (line, i) =>
          `${prefix}${
            this.settings.prefix.length > 0
              ? i === 0
                ? this.settings.prefix + ' '
                : ' '.repeat(this.settings.prefix.length + 1)
              : ''
          }${line}`
      );
  }

  info(...msg: Accepted[]) {
    const entries = this.toLogEntries(chalk.blue(`info  `), msg);
    this.log(entries);
  }

  warn(...msg: Accepted[]) {
    const entries = this.toLogEntries(chalk.yellow(`warn  `), msg);
    this.log(entries);
  }

  error(...msg: Accepted[]) {
    const entries = this.toLogEntries(chalk.red(`error `), msg);
    this.log(entries);
  }
}

export const log = new Logger();
