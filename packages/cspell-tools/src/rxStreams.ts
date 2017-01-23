import * as Rx from 'rxjs/Rx';
import * as stream from 'stream';
import * as iconv from 'iconv-lite';

export function observableToStream<T>(data: Rx.Observable<T>) {
    const sourceStream = new stream.PassThrough();

    data.subscribe(
        data => sourceStream.write(data, 'UTF-8'),
        error => sourceStream.emit('error', error),
        () => sourceStream.end()
    );

    return sourceStream;
}

export function streamToRx(stream: NodeJS.ReadableStream): Rx.Subject<Buffer> {
    const subject = new Rx.Subject<Buffer>();
    stream.on('end', () => subject.complete());
    stream.on('error', (e: Error) => subject.error(e));
    stream.on('data', (data: Buffer) => subject.next(data));
    return subject;
}

export function streamToStringRx(stream: NodeJS.ReadableStream, encoding: string = 'UTF-8'): Rx.Observable<string> {
    return streamToRx(stream)
        .map(buffer => iconv.decode(buffer, encoding));
}
