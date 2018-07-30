import { Monitor } from '@neo-one/monitor';
import { QueryDeduplicator } from '@neotracker/shared-graphql';
import { ApolloLink, FetchResult, Observable, Operation } from 'apollo-link';
import { defer, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { createQueryDeduplicator } from './createQueryDeduplicator';
import { LiveClient } from './LiveClient';

const POLLING_TIME_MS = 15000;

const HTTPS = 'https';
const WSS = 'wss';
const HTTP = 'http';
const WS = 'ws';
const getWebsocketEndpoint = (endpoint: string) => {
  if (endpoint.startsWith(HTTPS)) {
    return `${WSS}${endpoint.slice(HTTPS.length)}`;
  }

  if (endpoint.startsWith(HTTP)) {
    return `${WS}${endpoint.slice(HTTP.length)}`;
  }

  const { location } = window;
  const proto = location.protocol === `${HTTPS}:` ? WSS : WS;

  return `${proto}://${location.host}${endpoint}`;
};

export class LiveLink extends ApolloLink {
  private readonly liveClient: LiveClient | undefined;
  private readonly queryDeduplicator: QueryDeduplicator;

  public constructor({ endpoint, monitor: monitorIn }: { readonly endpoint: string; readonly monitor: Monitor }) {
    const monitor = monitorIn.at('graphql_live_link');
    super();
    try {
      this.liveClient = new LiveClient({
        endpoint: getWebsocketEndpoint(endpoint),
        monitor,
      });
    } catch (error) {
      monitor.logError({ name: 'graphql_create_live_client_error', error });
    }

    this.queryDeduplicator = createQueryDeduplicator({ endpoint, monitor });
  }

  // tslint:disable-next-line rxjs-finnish
  public request(operation: Operation): Observable<FetchResult> {
    const definition = operation.query.definitions.find((def) => def.kind === 'OperationDefinition');
    if (definition === undefined || definition.kind !== 'OperationDefinition') {
      throw new Error('Expected one operation');
    }

    const { variables } = operation;
    // tslint:disable-next-line no-any
    const id: string = (operation.query as any).id;
    const { monitor } = operation.getContext();
    if (definition.operation === 'mutation') {
      return new Observable((subscriber) =>
        // tslint:disable-next-line no-any
        defer(async () => this.queryDeduplicator.execute({ id, variables, monitor })).subscribe(subscriber as any),
      );
    }

    const result$ =
      this.liveClient === undefined
        ? interval(POLLING_TIME_MS).pipe(
            switchMap(async () => this.queryDeduplicator.execute({ id, variables, monitor })),
          )
        : this.liveClient.request$({ id, variables }, monitor);

    // tslint:disable-next-line no-any
    return new Observable((subscriber) => result$.subscribe(subscriber as any));
  }
}
