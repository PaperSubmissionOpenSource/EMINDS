declare const InsertNodeInPolyline: {
    pluginName: string;
    _lf: any;
    dndAdd: boolean;
    dropAdd: boolean;
    install(lf: any): void;
    eventHandler(): void;
    insetNode(nodeData: any): void;
};
export { InsertNodeInPolyline };
export default InsertNodeInPolyline;
