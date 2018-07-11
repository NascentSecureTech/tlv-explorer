import {Router, RouterConfiguration} from 'aurelia-router';
//
export class App {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router): void {
    this.router = router;

    config.title = 'CGX Tools';

    config.map([
      { route: ['', 'tlv-explorer'], moduleId: 'tools/tlv-explorer/tlv-explorer', title: 'TLV Explorer' },
      { route: 'apdu-explorer', moduleId: 'tools/test-tool', name: 'contacts' }
    ]);

  }
}
