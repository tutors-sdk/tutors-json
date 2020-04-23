import { Course } from '@tutors-sdk/tutors-lib/src/models/course';
import { LearningObject } from '@tutors-sdk/tutors-lib/src/models/lo';
import { Topic, Unit } from '@tutors-sdk/tutors-lib/src/models/topic';
import { Archive, PanelTalk, Talk } from '@tutors-sdk/tutors-lib/src/models/los';
import { PanelVideo } from '@tutors-sdk/tutors-lib/src/models/web-los';
import { writeFile } from '@tutors-sdk/tutors-lib/src/utils/futils';
import { Lab } from '@tutors-sdk/tutors-lib/src/models/lab';

export class JsonEmitter {
  version = '0.0';

  emitLo(lo: LearningObject, url: string, jsonObj: any) {
    jsonObj.properties = lo.properties;
    jsonObj.title = lo.title;
    jsonObj.type = lo.lotype;
    jsonObj.summary = lo.objectivesMd;
    jsonObj.img = `https://${url}/${lo.img}`;
    if (lo.videoid) {
      jsonObj.video = `#video/${url}/${lo.videoid}`;
    }
    jsonObj.id = lo.folder;
    jsonObj.route = lo.link;
    jsonObj.hide = lo.hide;
  }

  emitTalk(lo: Talk, url: string, jsonObj: any) {
    jsonObj.pdf = `https://${url}/${lo.link}`;
    jsonObj.route = `#talk/${url}/${lo.link}`;
  }

  emitLab(lo: Lab, url: string, jsonObj: any) {
    jsonObj.route = `#lab/${url}`;
    jsonObj.los = [];
    lo.chapters.forEach((chapter) => {
      let jsonChapter: any = {};
      jsonChapter.title = chapter.title;
      jsonChapter.shortTitle = chapter.shortTitle;
      jsonChapter.contentMd = chapter.contentMd;
      jsonChapter.route = `${jsonObj.route}/${chapter.shortTitle}`;
      jsonObj.los.push(jsonChapter);
    });
  }

  emitPanelTalk(lo: PanelTalk, url: string, jsonObj: any) {
    jsonObj.pdf = `https://${url}/${lo.link}`;
    jsonObj.route = `#talk/${url}/${lo.link}`;
  }

  emitArchive(lo: Archive, url: string, jsonObj: any) {
    jsonObj.route = `https://${url}/${lo.link}`;
  }

  emitPanelVideo(lo: PanelVideo, url: string, jsonObj: any) {
    jsonObj.route = `#video/${url}/${lo.link}`;
  }

  emitUnit(lo: Unit, url: string, jsonObj: any) {
    url = url.substring(0, url.lastIndexOf('/')) + '/';
    this.emitTopic(lo, url, jsonObj);
    jsonObj.route = `#topic/${url}`;
  }

  emitTopic(lo: Topic, url: string, jsonObj: any) {
    const topicUrl = `${url}${lo.folder}`;
    this.emitLo(lo, topicUrl, jsonObj);
    jsonObj.route = `#topic/${topicUrl}`;
    jsonObj.los = [];
    lo.los.forEach((lo) => {
      let loJson: any = {};
      const baseUrl = `${topicUrl}/${lo.folder}`;
      this.emitLo(lo, baseUrl, loJson);
      switch (lo.lotype) {
        case 'unit':
          this.emitUnit(lo as Unit, baseUrl, loJson);
          break;
        case 'talk':
          this.emitTalk(lo as Talk, baseUrl, loJson);
          break;
        case 'lab':
          this.emitLab(lo as Lab, baseUrl, loJson);
          break;
        case 'paneltalk':
          this.emitPanelTalk(lo as PanelTalk, baseUrl, loJson);
          break;
        case 'archive':
          this.emitArchive(lo as Archive, baseUrl, loJson);
          break;
        case 'panelvideo':
          this.emitPanelVideo(lo as PanelVideo, baseUrl, loJson);
          break;
      }
      jsonObj.los.push(loJson);
    });
  }

  emitCourse(lo: Course, url: string, jsonObj: any) {
    this.emitLo(lo, url, jsonObj);
    jsonObj.version = this.version;
    jsonObj.los = [];
    lo.los.forEach((lo) => {
      let topicObj: any = {};
      this.emitTopic(lo as Topic, url, topicObj);
      jsonObj.los.push(topicObj);
    });
    jsonObj.enrollment = lo.enrollment;
  }

  generateCourse(version: string, path: string, course: Course) {
    let courseJson: any = {};
    courseJson.version = version.toString();
    this.emitCourse(course, '{{COURSEURL}}/', courseJson);
    writeFile(path, 'tutors.json', JSON.stringify(courseJson));
  }
}
