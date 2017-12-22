// type shim for nodejs' `require()` syntax
declare const require: (module: string) => any;

declare const NETHEROS_PROCESS_INIT = 'init';

interface SerializedProcess {
    name: string
    priority: number
    metaData: object
    suspend: string | number | boolean
    parent: string | boolean
}

interface ProcessTable{
    [name: string]: Process
}

declare const processTypes = <{[type: string]: any}>{
    'init': InitProcess,
}