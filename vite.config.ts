/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import path, { resolve } from 'path'
import { typescriptPaths } from 'rollup-plugin-typescript-paths'
import typescript from '@rollup/plugin-typescript'
import inject from '@rollup/plugin-inject'
import basicSsl from '@vitejs/plugin-basic-ssl'
import viteVConsole from 'vite-plugin-vconsole'
import removeConsole from 'vite-plugin-remove-console'

// https://vitejs.dev/config https://vitest.dev/config
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      viteVConsole({
        entry: path.resolve('src/components/Demo.tsx'),
        enabled: false,
        config: {
          maxLogNumber: 1000,
          theme: 'dark'
        }
      }),
      tsconfigPaths(),
      mode === 'development'
        ? inject({
            Buffer: ['buffer', 'Buffer'],
            process: path.resolve('src/utils/processInject')
          })
        : null,
      // basicSsl({
      //   /** name of certification */
      //   name: 'localhosttest',
      //   /** custom trust domains */
      //   domains: ['localhost'],
      //   /** custom certification directory */
      //   certDir: '/Users/.../.devServer/cert'
      // })
      removeConsole()
    ],
    server: {
      host: '0.0.0.0'
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: '.vitest/setup',
      include: ['**/test.{ts,tsx}']
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: {
      minify: true,
      reportCompressedSize: true,
      lib: {
        entry: resolve(__dirname, 'src/main.ts'),
        formats: ['es', 'cjs'],
        fileName: 'main'
      },
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          '@tanstack/react-query',
          'classnames',
          'ethereum-qr-code',
          '@tomo-inc/social-wallet-sdk',
          'viem',
          '@cosmjs/stargate',
          '@tomo-inc/tomo-wallet-provider'
        ],
        plugins: [
          // inject({
          //   Buffer: ['buffer', 'Buffer'],
          //   process: path.resolve('src/utils/processInject')
          // }),
          typescriptPaths({
            preserveExtensions: true
          }),
          typescript({
            sourceMap: false,
            declaration: true,
            outDir: 'dist'
          })
        ]
      }
    }
  }
})
