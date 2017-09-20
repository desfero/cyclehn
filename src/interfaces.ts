import { Stream } from 'xstream';
import { VNode, DOMSource } from '@cycle/dom';
import { HTTPSource, RequestOptions } from '@cycle/http';
import { TimeSource } from '@cycle/time';
import { RouterSink, RouterSource } from 'cyclic-router';
import { StateSource } from 'cycle-onionify';

export type Sources = {
    DOM: DOMSource;
    HTTP: HTTPSource;
    router: RouterSource,
};

export type RootSinks = {
    DOM: Stream<VNode>;
    HTTP: Stream<RequestOptions>;
    router: RouterSink;
};

export type Sinks = Partial<RootSinks>;
export type Component = (s: Sources) => Sinks;

export type AppSources = Sources & { onion: StateSource<any> };
export type AppSinks = Sinks & { onion: Stream<Reducer> };
export type Reducer = (prev: AppState) => AppState;
export type AppState = {
    hamburgerActive: boolean;
};