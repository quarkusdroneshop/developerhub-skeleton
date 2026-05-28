"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPipelineRunAction = void 0;
const plugin_scaffolder_node_1 = require("@backstage/plugin-scaffolder-node");
const js_yaml_1 = __importDefault(require("js-yaml"));
const client_node_1 = __importDefault(require("@kubernetes/client-node"));
const createPipelineRunAction = () => (0, plugin_scaffolder_node_1.createTemplateAction)({
    id: 'kubernetes:create-pipelinerun',
    description: 'Create Tekton PipelineRun using in-cluster auth',
    schema: {
        input: (z) => z.object({
            namespace: z.string(),
            manifest: z.string(),
        }),
    },
    async handler(ctx) {
        const kc = new client_node_1.default.KubeConfig();
        kc.loadFromCluster();
        const client = kc.makeApiClient(client_node_1.default.CustomObjectsApi);
        const resource = js_yaml_1.default.load(ctx.input.manifest);
        await client.createNamespacedCustomObject('tekton.dev', 'v1', ctx.input.namespace, 'pipelineruns', resource);
        ctx.logger.info(`PipelineRun created in ${ctx.input.namespace}`);
    },
});
exports.createPipelineRunAction = createPipelineRunAction;
