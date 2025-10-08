import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-fetch',
  input: '../user/openapi.yaml',
  output: {
    path: 'src/infrastructure/external/generated/user-api',
    format: 'prettier',
  },
  types: {
    enums: 'javascript',
  },
});
