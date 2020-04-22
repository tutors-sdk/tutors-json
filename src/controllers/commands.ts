import * as fs from 'fs';

import program = require('commander');
import { generateNetlifyToml } from './netlify';
import { Course } from '@tutors-sdk/tutors-lib/src/models/course';


export interface CommandOptions {
  version: string;
  templates: boolean;
  new: boolean;
  private: boolean;
  rootPath: string;

  [propName: string]: any;
}

function createRoot(options: CommandOptions): Course | null {
  if (fs.existsSync('course.md')) {
    return new Course();
  }
  return null;
}

export class Commands {
  rootPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
    program
      .arguments('<file>')
      .version(require('../../package.json').version)
      .parse(process.argv);
  }

  exec(): void {
    const options = program.opts() as CommandOptions;
    options.rootPath = this.rootPath;
    console.log('tutors-json course web generator: ' + options.version);
      const rootLearningObject = createRoot(options);
      if (rootLearningObject) {
        let site = 'json';
        rootLearningObject.publish(site);
        generateNetlifyToml(site, rootLearningObject.properties!.courseurl)
      } else {
        console.log('Cannot locate course.md or portfolio.yaml. Change to course folder and try again. ');
      }

  }
}
