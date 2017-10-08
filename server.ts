import * as express from 'express';
import * as serialize from 'serialize-javascript';
import onionify from 'cycle-onionify';
import switchPath from 'switch-path';
import xs from 'xstream';
import {
    html, head, title,
    body, div, script,
    VNode, link
} from '@cycle/dom';
import { makeHTMLDriver } from '@cycle/html';
import { run } from '@cycle/run';
import { makeHTTPDriver } from '@cycle/http';
import { makeServerHistoryDriver } from '@cycle/history';
import { routerify } from 'cyclic-router';

import { App } from './src/app';

function wrapVTreeWithHTMLBoilerplate([vtree, onion]: any): VNode {
    return (
        html([
            head([
                title('Cycle Isomorphism Example'),
                link({ props: { rel: 'stylesheet', href: 'https://hnpwa.drakkein.me/main.css?7ef3c9b4ccbaf9f653a1' }})
            ]),
            body([
                div('#app', [vtree]),
                script(`window.SERVER_SNAPSHOT = ${serialize({ onion })};`),
                // script({ props: {  type: 'text/javascript', src: 'http://localhost:8080/bundle.js?0f9cfcfb3fdc1910740d' }})
            ])
        ])
    );
}

function prependHTML5Doctype(html: string): string {
    return `<!doctype html>${html}`;
}

function wrapAppResultWithBoilerplate(appFn: any): any {
    return function wrappedAppFn(sources: any): any {
        const sinks = appFn(sources);

        const vdom$ = sinks.DOM.drop(1).take(1);

        const wrappedVDOM$ = xs.combine(vdom$, sinks.onion)
            .map(wrapVTreeWithHTMLBoilerplate);

        return {
            ...sinks,
            DOM: wrappedVDOM$
        };
    };
}

const server = express();

server.use(function(req: any, res: any): any {
    // Ignore favicon requests
    if (req.url === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'});
        res.end();
        return;
    }
    console.log(`req: ${req.method} ${req.url}`);

    const htmlied = onionify(routerify(wrapAppResultWithBoilerplate(App), switchPath));

    // noinspection TsLint
    run(htmlied, {
        DOM: makeHTMLDriver(html => res.send(prependHTML5Doctype(html))),
        history: makeServerHistoryDriver(),
        HTTP: makeHTTPDriver()
    });
});

const port = process.env.PORT || 3000;
server.listen(port);
console.log(`Listening on port ${port}`);