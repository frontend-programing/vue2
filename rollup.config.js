import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'

export default {
  input: './src/index.js',
  output: {
    file: 'dist/umd/vue.js',
    name: 'vue',
    format: 'iife',
    name: 'Vue',
    sourcemap: true
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    process.env.ENV === 'development'
      ? serve({
          port: 8080,
          open: true,
          openPage: '/public/index.html',
          contentBase: ''
        })
      : null
  ]
}
