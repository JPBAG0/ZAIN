import { createHandler } from '../server/pedidos.mjs';
export default { fetch: createHandler(process.env) };
