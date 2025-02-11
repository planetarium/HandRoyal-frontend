import { config as dotenvConfig } from 'dotenv';
import type { CodegenConfig } from '@graphql-codegen/cli'

// .env 파일 로드
dotenvConfig();

const { GRAPHQL_ENDPOINT } = process.env;

if (!GRAPHQL_ENDPOINT) {
  throw new Error('GRAPHQL_ENDPOINT is not defined in environment variables');
}

const config: CodegenConfig = {
   schema: GRAPHQL_ENDPOINT,
   documents: ['src/**/*.tsx', 'src/**/*.ts'],
   generates: {
      './src/gql/': {
        preset: 'client',
        plugins: []
      }
   }
}
export default config